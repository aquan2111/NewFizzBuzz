using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NewFizzBuzz.Tests
{
    public class AttemptServiceTests
    {
        private readonly NewFizzBuzzDbContext _dbContext;
        private readonly AttemptService _attemptService;

        public AttemptServiceTests()
        {
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // Generate a new DB instance for each test
                .Options;

            _dbContext = new NewFizzBuzzDbContext(options);

            var mockLogger = new Mock<ILogger<AttemptService>>();
            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

            _attemptService = new AttemptService(_dbContext, mockHttpContextAccessor.Object, mockLogger.Object);

            SeedDatabase();
        }

        private void SeedDatabase()
        {
            _dbContext.Users.Add(new User { Id = 1, Email = "test@example.com" });

            var quiz = new Quiz
            {
                Id = 1,
                Title = "FizzBuzz Quiz",
                AuthorId = 1,
                Rules = new List<Rule>
                {
                    new Rule { QuizId = 1, Divisor = 3, Word = "Fizz" },
                    new Rule { QuizId = 1, Divisor = 5, Word = "Buzz" }
                }
            };

            _dbContext.Quizzes.Add(quiz);
            _dbContext.SaveChanges();
        }

        [Fact]
        public async Task CreateAttemptAsync_ShouldCreateAttempt_WhenValidData()
        {
            // Act
            var attempt = await _attemptService.CreateAttemptAsync(1, 1, 30);

            // Assert
            Assert.NotNull(attempt);
            Assert.Equal(1, attempt.QuizId);
            Assert.Equal(1, attempt.UserId);
            Assert.Equal(30, attempt.TimeLimit);
            Assert.Equal(100, attempt.AttemptAnswers.Count);
        }

        [Fact]
        public async Task CreateAttemptAsync_ShouldThrowException_WhenQuizNotFound()
        {
            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() =>
                _attemptService.CreateAttemptAsync(999, 1, 30));

            Assert.Equal("An error occurred while starting the attempt.", exception.Message);
        }

        [Fact]
        public async Task GetAllAttemptsAsync_ShouldReturnAttempts()
        {
            // Arrange
            await _attemptService.CreateAttemptAsync(1, 1, 30);

            // Act
            var attempts = await _attemptService.GetAllAttemptsAsync();

            // Assert
            Assert.NotEmpty(attempts);
            Assert.Single(attempts);
        }

        [Fact]
        public async Task GetAttemptByIdAsync_ShouldReturnAttempt_WhenExists()
        {
            // Arrange
            var attempt = await _attemptService.CreateAttemptAsync(1, 1, 30);

            // Act
            var fetchedAttempt = await _attemptService.GetAttemptByIdAsync(attempt.Id);

            // Assert
            Assert.NotNull(fetchedAttempt);
            Assert.Equal(attempt.Id, fetchedAttempt.Id);
        }

        [Fact]
        public async Task GetAttemptByIdAsync_ShouldReturnNull_WhenNotExists()
        {
            // Act
            var attempt = await _attemptService.GetAttemptByIdAsync(999);

            // Assert
            Assert.Null(attempt);
        }

        [Fact]
        public async Task GetAttemptsByUserAsync_ShouldReturnUserAttempts()
        {
            // Arrange
            await _attemptService.CreateAttemptAsync(1, 1, 30);
            await _attemptService.CreateAttemptAsync(1, 1, 40);

            // Act
            var attempts = await _attemptService.GetAttemptsByUserAsync(1);

            // Assert
            Assert.Equal(2, attempts.Count);
        }

        [Fact]
        public async Task GetAttemptsByUserOnQuizAsync_ShouldReturnAttempts()
        {
            // Arrange
            await _attemptService.CreateAttemptAsync(1, 1, 30);
            await _attemptService.CreateAttemptAsync(1, 1, 40);

            // Act
            var attempts = await _attemptService.GetAttemptsByUserOnQuizAsync(1, 1);

            // Assert
            Assert.Equal(2, attempts.Count);
        }

        [Fact]
        public async Task GetAttemptsByQuizAsync_ShouldReturnAttempts()
        {
            // Arrange
            await _attemptService.CreateAttemptAsync(1, 1, 30);
            await _attemptService.CreateAttemptAsync(1, 2, 30);

            // Act
            var attempts = await _attemptService.GetAttemptsByQuizAsync(1);

            // Assert
            Assert.Equal(2, attempts.Count);
        }

        [Fact]
        public async Task RecordAttemptAnswerAsync_ShouldRecordAnswer()
        {
            // Arrange
            var attempt = await _attemptService.CreateAttemptAsync(1, 1, 30);
            var quizQuestionId = 3; // Example question number
            var answer = "Fizz";
            var isCorrect = true;

            // Act
            await _attemptService.RecordAttemptAnswerAsync(attempt.Id, quizQuestionId, answer, isCorrect);

            // Assert
            var updatedAttempt = await _attemptService.GetAttemptByIdAsync(attempt.Id);
            Assert.NotNull(updatedAttempt);
            Assert.Contains(updatedAttempt.AttemptAnswers, aa => aa.QuizQuestionId == quizQuestionId && aa.Answer == answer && aa.IsCorrect);
        }

        [Fact]
        public async Task RecordAttemptAnswerAsync_ShouldThrowException_WhenAttemptNotFound()
        {
            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() =>
                _attemptService.RecordAttemptAnswerAsync(999, 1, "Fizz", true));

            Assert.Equal("Attempt not found.", exception.Message);
        }

        [Fact]
        public void IsAnswerCorrect_ShouldReturnTrue_WhenAnswerMatches()
        {
            // Act
            var result = _attemptService.IsAnswerCorrect(3, 1, "Fizz");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void IsAnswerCorrect_ShouldReturnFalse_WhenAnswerDoesNotMatch()
        {
            // Act
            var result = _attemptService.IsAnswerCorrect(3, 1, "Buzz");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void GetCorrectAnswerBasedOnRules_ShouldReturnCorrectAnswer()
        {
            // Arrange
            var rules = new List<Rule>
            {
                new Rule { Divisor = 3, Word = "Fizz" },
                new Rule { Divisor = 5, Word = "Buzz" }
            };

            // Act
            var answer = _attemptService.GetCorrectAnswerBasedOnRules(15, rules);

            // Assert
            Assert.Equal("FizzBuzz", answer);
        }

        [Fact]
        public void GetCorrectAnswerBasedOnRules_ShouldReturnNumber_WhenNoRulesMatch()
        {
            // Arrange
            var rules = new List<Rule>
            {
                new Rule { Divisor = 3, Word = "Fizz" },
                new Rule { Divisor = 5, Word = "Buzz" }
            };

            // Act
            var answer = _attemptService.GetCorrectAnswerBasedOnRules(7, rules);

            // Assert
            Assert.Equal("7", answer);
        }
    }
}
