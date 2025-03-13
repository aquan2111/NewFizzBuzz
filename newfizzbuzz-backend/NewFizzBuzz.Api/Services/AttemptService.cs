using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using Microsoft.Extensions.Logging;
using NewFizzBuzz.Api.Controllers;

namespace NewFizzBuzz.Api.Services
{
    public class AttemptService
    {
        private readonly NewFizzBuzzDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AttemptService> _logger;

        public AttemptService(NewFizzBuzzDbContext context, IHttpContextAccessor httpContextAccessor, ILogger<AttemptService> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        // Fetch all attempts for the user
        public virtual async Task<List<Attempt>> GetAllAttemptsAsync()
        {
            return await _context.Attempts
                .Include(a => a.AttemptAnswers) // Include related AttemptAnswers
                .OrderByDescending(a => a.AttemptedAt)
                .ToListAsync();
        }

        // Fetch a specific attempt by its ID
        public virtual async Task<Attempt?> GetAttemptByIdAsync(int attemptId)
        {
            return await _context.Attempts
                .Include(a => a.AttemptAnswers) // Include related AttemptAnswers
                    .ThenInclude(aa => aa.QuizQuestion)
                .Include(a => a.Quiz)  // Include related Quiz
                .FirstOrDefaultAsync(a => a.Id == attemptId);
        }

        // Fetch all attempts for a specific user
        public virtual async Task<List<Attempt>> GetAttemptsByUserAsync(int userId)
        {
            return await _context.Attempts
                .Where(a => a.UserId == userId)
                .Include(a => a.AttemptAnswers) // Include related AttemptAnswers
                .OrderByDescending(a => a.AttemptedAt)
                .ToListAsync();
        }

        // Fetch attempts by a specific user on a specific quiz
        public virtual async Task<List<Attempt>> GetAttemptsByUserOnQuizAsync(int userId, int quizId)
        {
            return await _context.Attempts
                .Where(a => a.UserId == userId && a.QuizId == quizId)
                .Include(a => a.AttemptAnswers) // Include related AttemptAnswers
                .OrderByDescending(a => a.AttemptedAt)
                .ToListAsync();
        }

        // Fetch all attempts for a specific quiz
        public virtual async Task<List<Attempt>> GetAttemptsByQuizAsync(int quizId)
        {
            return await _context.Attempts
                .Where(a => a.QuizId == quizId)
                .Include(a => a.AttemptAnswers) // Include related AttemptAnswers
                .OrderByDescending(a => a.AttemptedAt)
                .ToListAsync();
        }

        // Fetch quiz rules for a specific quiz
        public virtual async Task<List<Rule>> GetQuizRulesByQuizIdAsync(int quizId)
        {
            return await _context.Rules
                .Where(r => r.QuizId == quizId)
                .ToListAsync();
        }

        // Method to create a new attempt
        public virtual async Task<Attempt> CreateAttemptAsync(int quizId, int userId, int timeLimit)
        {
            try
            {
                var quiz = await _context.Quizzes
                .Include(q => q.Rules)
                .FirstOrDefaultAsync(q => q.Id == quizId);

                if (quiz == null)
                    throw new Exception("Quiz not found");

                // Generate numbers from 1 to 100 dynamically for the quiz questions
                var quizQuestions = Enumerable.Range(1, 100).ToList();

                // Shuffle the questions if needed
                var random = new Random();
                var shuffledQuestions = quizQuestions.OrderBy(x => random.Next()).Take(100).ToList();

                var attempt = new Attempt
                {
                    UserId = userId,
                    QuizId = quizId,
                    TimeLimit = timeLimit,
                    TotalQuestions = 0,
                    AttemptAnswers = shuffledQuestions.Select(q => new AttemptAnswer
                    {
                        QuizQuestionId = q, // Using the number as the question
                        Answer = "", // The answer will be filled in later
                        IsCorrect = false
                    }).ToList()
                };

                _context.Attempts.Add(attempt);
                await _context.SaveChangesAsync();

                return attempt;
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                _logger.LogError(ex, "Error starting attempt");

                // Rethrow the exception so the caller can handle it
                throw new Exception("An error occurred while starting the attempt.");
            }
        }

        // Method to record an answer attempt
        public virtual async Task RecordAttemptAnswerAsync(int attemptId, int quizQuestionId, string answer, bool isCorrect)
        {
            var attempt = await _context.Attempts
                .Include(a => a.AttemptAnswers)
                .FirstOrDefaultAsync(a => a.Id == attemptId);

            if (attempt == null) throw new Exception("Attempt not found.");

            // Add the new answer
            var attemptAnswer = new AttemptAnswer
            {
                AttemptId = attemptId,
                QuizQuestionId = quizQuestionId,
                Answer = answer,
                IsCorrect = isCorrect
            };

            _context.AttemptAnswers.Add(attemptAnswer);

            //attempt.TotalQuestions = attempt.AttemptAnswers.Count + 1;

            // Update the score based on the number of correct answers
            attempt.CorrectCount = attempt.AttemptAnswers.Count(a => a.IsCorrect);

            await _context.SaveChangesAsync();
        }


        // FizzBuzz logic to check if an answer is correct based on quiz rules
        public virtual bool IsAnswerCorrect(int number, int quizId, string answer)
        {
            var quizRules = _context.Rules.Where(r => r.QuizId == quizId).ToList();

            string correctAnswer = GetCorrectAnswerBasedOnRules(number, quizRules);
            return string.Equals(correctAnswer, answer, StringComparison.OrdinalIgnoreCase);
        }

        // Determine the correct answer based on the quiz's rules
        public virtual string GetCorrectAnswerBasedOnRules(int number, List<Rule> rules)
        {
            _logger.LogInformation($"Checking number {number} against rules: {string.Join(", ", rules.Select(r => $"{r.Divisor}->{r.Word}"))}");

            string answer = string.Empty;

            foreach (var rule in rules)
            {
                if (number % rule.Divisor == 0)
                {
                    _logger.LogInformation($"Number {number} is divisible by {rule.Divisor}, adding '{rule.Word}' to answer.");
                    answer += rule.Word;
                }
            }

            // If no words were added, the correct answer is the number itself
            string finalAnswer = string.IsNullOrEmpty(answer) ? number.ToString() : answer;
            _logger.LogInformation($"Final computed answer for {number} is: {finalAnswer}");

            return finalAnswer;
        }

    }
}
