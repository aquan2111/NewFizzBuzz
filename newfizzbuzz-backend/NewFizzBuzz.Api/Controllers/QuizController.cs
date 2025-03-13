using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using System.Security.Claims;

namespace NewFizzBuzz.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizController : ControllerBase
    {
        private readonly NewFizzBuzzDbContext _context;
        private readonly QuizService _quizService;

        public QuizController(NewFizzBuzzDbContext context, QuizService quizService)
        {
            _context = context;
            _quizService = quizService;
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

        // POST: api/quiz
        [HttpPost]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizRequest request)
        {
            var userIdClaim = User.FindFirstValue("UserId");

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var parsedUserId))
            {
                return Unauthorized("Invalid or missing user ID in token.");
            }

            var duplicateNumbers = request.Rules
                .GroupBy(r => r.Divisor)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateNumbers.Any())
            {
                return BadRequest(new { message = $"Rules contain duplicate numbers: {string.Join(", ", duplicateNumbers)}" });
            }

            var quiz = new Quiz
            {
                Title = request.Title,
                AuthorId = parsedUserId,
                Rules = request.Rules?.Select(r => new Rule
                {
                    Divisor = r.Divisor,
                    Word = r.Word
                }).ToList() ?? new List<Rule>(),
            };

            _context.Quizzes.Add(quiz);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Database update error: {ex.InnerException?.Message ?? ex.Message}");
                return BadRequest("An error occurred while saving the quiz.");
            }

            // Return QuizDTO instead of full entity
            var quizDTO = new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Rules = quiz.Rules.Select(r => new RuleDto
                {
                    Divisor = r.Divisor,
                    Word = r.Word
                }).ToList()
            };

            return CreatedAtAction(nameof(GetQuiz), new { id = quiz.Id }, quizDTO);
        }

        // GET: api/quiz/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuizDto>> GetQuiz(int id)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Rules)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null) return NotFound();

            // Map entity to DTO manually
            var quizDto = new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Rules = quiz.Rules.Select(r => new RuleDto
                {
                    Id = r.Id,
                    Divisor = r.Divisor,
                    Word = r.Word
                }).ToList()
            };

            return Ok(quizDto);
        }


        // GET: api/quiz
        // This will fetch all quizzes (created by any user)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuizDto>>> GetAllQuizzes()
        {
            var quizzes = await _quizService.GetAllQuizzesAsync();

            var quizDTOs = quizzes.Select(q => new QuizDto
            {
                Id = q.Id,
                Title = q.Title,
                Rules = q.Rules.Select(r => new RuleDto
                {
                    Divisor = r.Divisor,
                    Word = r.Word
                }).ToList()
            }).ToList();

            return Ok(quizDTOs);
        }

        // GET: api/quiz/user
        // This will fetch quizzes created by the logged-in user
        [HttpGet("user/{userId?}")] // The `?` makes userId optional
        public async Task<ActionResult<IEnumerable<QuizDto>>> GetUserQuizzes(int? userId)
        {
            if (!userId.HasValue) // If no userId is provided, get from claims
            {
                userId = GetUserIdFromClaims();
            }

            var quizzes = await _quizService.GetQuizzesByUserIdAsync(userId.Value);

            if (quizzes == null || !quizzes.Any())
            {
                return NotFound("No quizzes found for this user.");
            }

            var quizDTOs = quizzes.Select(q => new QuizDto
            {
                Id = q.Id,
                Title = q.Title,
                Rules = q.Rules.Select(r => new RuleDto
                {
                    Divisor = r.Divisor,
                    Word = r.Word
                }).ToList()
            }).ToList();

            return Ok(quizDTOs);
        }


        // PUT: api/quiz/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuiz(int id, [FromBody] CreateQuizRequest request)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Rules)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
            {
                return NotFound();
            }

            if (quiz.AuthorId != GetUserIdFromClaims())
            {
                return Unauthorized("You are not authorized to update this quiz.");
            }

            quiz.Title = request.Title;

            quiz.Rules.Clear();

            foreach (var ruleRequest in request.Rules)
            {
                quiz.Rules.Add(new Rule
                {
                    Divisor = ruleRequest.Divisor,
                    Word = ruleRequest.Word,
                    QuizId = quiz.Id
                });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/quiz/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var quiz = await _context.Quizzes.FindAsync(id);

            if (quiz == null)
            {
                return NotFound();
            }

            if (quiz.AuthorId != GetUserIdFromClaims())
            {
                return Unauthorized("You are not authorized to delete this quiz.");
            }

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
