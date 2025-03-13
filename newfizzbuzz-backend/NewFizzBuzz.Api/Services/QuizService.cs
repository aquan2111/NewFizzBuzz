using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using System.Threading.Tasks;

namespace NewFizzBuzz.Api.Services
{
    public class QuizService
    {
        private readonly NewFizzBuzzDbContext _context;

        public QuizService(NewFizzBuzzDbContext context)
        {
            _context = context;
        }

        // Create a new quiz
        public async Task<Quiz> CreateQuizAsync(string title, int userId, List<CreateRuleRequest> rules)
        {
            var quiz = new Quiz
            {
                Title = title,
                AuthorId = userId
            };

            var uniqueDivisors = new HashSet<int>();

            foreach (var ruleRequest in rules)
            {
                if (!uniqueDivisors.Add(ruleRequest.Divisor)) // 🚨 Checks duplicate in-memory
                {
                    throw new InvalidOperationException($"Divisor {ruleRequest.Divisor} is duplicated in input.");
                }

                var rule = new Rule
                {
                    Divisor = ruleRequest.Divisor,
                    Word = ruleRequest.Word
                };

                quiz.Rules.Add(rule);
            }

            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();
            return quiz;
        }


        // Get a specific quiz by its ID
        public async Task<Quiz?> GetQuizAsync(int quizId)
        {
            return await _context.Quizzes
                .Include(q => q.Rules)
                .FirstOrDefaultAsync(q => q.Id == quizId);
        }

        // Get all quizzes for a specific user
        public async Task<List<Quiz>> GetQuizzesByUserIdAsync(int userId)
        {
            return await _context.Quizzes
                .Where(q => q.AuthorId == userId)
                .Include(q => q.Rules)
                .ToListAsync();
        }

        public async Task<List<Quiz>> GetAllQuizzesAsync()
        {
            return await _context.Quizzes
                .Include(q => q.Rules)
                .ToListAsync();
        }


        // Update a quiz
        public async Task UpdateQuizAsync(int quizId, string title, int userId, List<CreateRuleRequest> rules)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Rules)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
            {
                throw new KeyNotFoundException($"Quiz with ID {quizId} not found.");
            }

            // Ensure that the user is the owner of the quiz
            if (quiz.AuthorId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to update this quiz.");
            }

            // Update quiz title
            quiz.Title = title;

            // Clear existing rules and add new ones
            quiz.Rules.Clear();
            foreach (var ruleRequest in rules)
            {
                var rule = new Rule
                {
                    Divisor = ruleRequest.Divisor,
                    Word = ruleRequest.Word
                };

                // Ensure divisors are unique for the quiz
                var existingRule = await _context.Rules
                    .FirstOrDefaultAsync(r => r.Divisor == rule.Divisor && r.QuizId == quiz.Id);
                if (existingRule != null)
                {
                    throw new InvalidOperationException($"Divisor {rule.Divisor} already exists in this quiz.");
                }

                quiz.Rules.Add(rule);
            }

            await _context.SaveChangesAsync();
        }

        // Delete a quiz
        public async Task DeleteQuizAsync(int quizId, int userId)
        {
            var quiz = await _context.Quizzes.FindAsync(quizId);

            if (quiz == null)
            {
                throw new KeyNotFoundException($"Quiz with ID {quizId} not found.");
            }

            // Ensure that the user is the owner of the quiz
            if (quiz.AuthorId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to delete this quiz.");
            }

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
        }
    }
}
