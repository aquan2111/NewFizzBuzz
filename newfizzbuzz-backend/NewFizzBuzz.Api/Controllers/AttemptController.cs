using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace NewFizzBuzz.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttemptController : ControllerBase
    {
        private readonly AttemptService _attemptService;
        private readonly ILogger<AttemptController> _logger;
        private readonly NewFizzBuzzDbContext _context;

        public AttemptController(AttemptService attemptService, ILogger<AttemptController> logger, NewFizzBuzzDbContext context)
        {
            _attemptService = attemptService;
            _logger = logger;
            _context = context;
        }

        // Get all attempts for the logged-in user
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetAttemptsByUserAsync(int userId)
        {
            var attempts = await _attemptService.GetAttemptsByUserAsync(userId);
            if (attempts == null || !attempts.Any())
            {
                return NotFound("No attempts found.");
            }

            return Ok(attempts);
        }

        // Get a specific attempt by ID
        [HttpGet("{attemptId}")]
        public async Task<IActionResult> GetAttemptByIdAsync(int attemptId)
        {
            var attempt = await _attemptService.GetAttemptByIdAsync(attemptId);
            if (attempt == null)
            {
                return NotFound(new { message = "Attempt not found" });
            }

            return Ok(attempt);
        }

        // Start a new attempt for a quiz
        [HttpPost("start")]
        public async Task<IActionResult> StartNewAttemptAsync([FromBody] StartAttemptRequest request)
        {
            try
            {
                var userId = GetUserIdFromClaims();
                if (userId <= 0) return Unauthorized();

                var attempt = await _attemptService.CreateAttemptAsync(request.QuizId, userId, request.TimeLimit);

                // Return the numbers as questions
                var questions = attempt.AttemptAnswers.Select(a => new {
                    id = a.QuizQuestionId,
                    number = a.QuizQuestionId // Use the number directly
                }).ToList();

                return Ok(new
                {
                    id = attempt.Id,
                    questions
                });
            }
            catch (Exception ex)
            {
                // Log the error and send a detailed response
                _logger.LogError(ex, "Error starting attempt");
                return StatusCode(500, "An error occurred while starting the attempt.");
            }
        }

        // Submit an answer for a quiz question during an attempt
        [HttpPost("submit-answer")]
        public async Task<IActionResult> SubmitAnswerAsync([FromBody] SubmitAnswerRequest request)
        {
            // Validate the answer (for example, check if it's correct based on quiz rules)
            var isCorrect = _attemptService.IsAnswerCorrect(request.QuizQuestionId, request.QuizId, request.Answer);

            // Record the answer attempt
            await _attemptService.RecordAttemptAnswerAsync(request.AttemptId, request.QuizQuestionId, request.Answer, isCorrect);

            // Update TotalQuestions dynamically by counting the number of non-empty answers
            var attempt = await _context.Attempts
                                         .Include(a => a.AttemptAnswers)
                                         .FirstOrDefaultAsync(a => a.Id == request.AttemptId);

            if (attempt != null)
            {
                // Count the number of answers that are not empty
                attempt.TotalQuestions = attempt.AttemptAnswers
                                                .Count(aa => !string.IsNullOrEmpty(aa.Answer));

                await _context.SaveChangesAsync(); // Persist the updated TotalQuestions
            }

            return Ok(new { isCorrect });
        }




        // Get all attempts for a specific user on a specific quiz
        [HttpGet("user/{userId}/quiz/{quizId}")]
        public async Task<IActionResult> GetAttemptsByUserOnQuizAsync(int userId, int quizId)
        {
            var attempts = await _attemptService.GetAttemptsByUserOnQuizAsync(userId, quizId);
            if (attempts == null || !attempts.Any())
            {
                return NotFound("No attempts found for this user on this quiz.");
            }

            return Ok(attempts);
        }

        // Get all attempts for a specific quiz
        [HttpGet("quiz/{quizId}")]
        public async Task<IActionResult> GetAttemptsByQuizAsync(int quizId)
        {
            var attempts = await _attemptService.GetAttemptsByQuizAsync(quizId);
            if (attempts == null || !attempts.Any())
            {
                return NotFound("No attempts found for this quiz.");
            }

            return Ok(attempts);
        }

        // Helper method to get the UserId from JWT Claims
        private int GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst("UserId"); // Ensure claim matches JWT payload
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("User ID not found in claims.");
            }
            return int.Parse(userIdClaim.Value);
        }
    }
}