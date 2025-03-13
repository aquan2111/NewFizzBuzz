using Microsoft.EntityFrameworkCore;
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
    public class QuizServiceTests
    {
        private readonly NewFizzBuzzDbContext _dbContext;
        private readonly QuizService _quizService;

        public QuizServiceTests()
        {
            // Ensure each test has a fresh, isolated in-memory database
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;
            _dbContext = new NewFizzBuzzDbContext(options);

            // Create the service using the isolated database
            _quizService = new QuizService(_dbContext);
        }

        [Fact]
        public async Task CreateQuizAsync_ShouldCreateQuiz_WhenValidData()
        {
            // Arrange
            _dbContext.Users.Add(new User { Id = 1, Email = "email@email.com" });
            await _dbContext.SaveChangesAsync();

            var rules = new List<CreateRuleRequest>
            {
                new CreateRuleRequest { Divisor = 3, Word = "Fizz" },
                new CreateRuleRequest { Divisor = 5, Word = "Buzz" }
            };

            // Act
            var quiz = await _quizService.CreateQuizAsync("Quiz 1", 1, rules);

            // Assert
            Assert.NotNull(quiz);
            Assert.Equal("Quiz 1", quiz.Title);
            Assert.Equal(1, quiz.AuthorId);
            Assert.Equal(2, quiz.Rules.Count);
        }

        [Fact]
        public async Task CreateQuizAsync_ShouldThrowException_WhenDivisorIsDuplicate()
        {
            // Arrange
            _dbContext.Users.Add(new User { Id = 1, Email = "email@email.com" });
            await _dbContext.SaveChangesAsync();

            var rules = new List<CreateRuleRequest>
            {
                new CreateRuleRequest { Divisor = 3, Word = "Fizz" },
                new CreateRuleRequest { Divisor = 3, Word = "Buzz" } // Duplicate divisor
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _quizService.CreateQuizAsync("Quiz 1", 1, rules));

            Assert.Contains("Divisor 3", exception.Message);
        }

        [Fact]
        public async Task GetQuizAsync_ShouldReturnQuiz_WhenExists()
        {
            // Arrange
            _dbContext.Users.Add(new User { Id = 1, Email = "email@email.com" });
            await _dbContext.SaveChangesAsync();

            var rules = new List<CreateRuleRequest>
            {
                new CreateRuleRequest { Divisor = 3, Word = "Fizz" },
                new CreateRuleRequest { Divisor = 5, Word = "Buzz" }
            };
            var quiz = await _quizService.CreateQuizAsync("Quiz 1", 1, rules);

            // Act
            var fetchedQuiz = await _quizService.GetQuizAsync(quiz.Id);

            // Assert
            Assert.NotNull(fetchedQuiz);
            Assert.Equal("Quiz 1", fetchedQuiz.Title);
            Assert.Equal(2, fetchedQuiz.Rules.Count);
        }

        [Fact]
        public async Task UpdateQuizAsync_ShouldUpdateQuiz_WhenValidData()
        {
            // Arrange
            _dbContext.Users.Add(new User { Id = 1, Email = "email@email.com" });
            await _dbContext.SaveChangesAsync();

            var rules = new List<CreateRuleRequest>
            {
                new CreateRuleRequest { Divisor = 3, Word = "Fizz" }
            };
            var quiz = await _quizService.CreateQuizAsync("Quiz 1", 1, rules);

            var updatedRules = new List<CreateRuleRequest>
            {
                new CreateRuleRequest { Divisor = 7, Word = "Bazz" }
            };

            // Act
            await _quizService.UpdateQuizAsync(quiz.Id, "Updated Quiz 1", 1, updatedRules);

            // Assert
            var updatedQuiz = await _quizService.GetQuizAsync(quiz.Id);
            Assert.NotNull(updatedQuiz);
            Assert.Equal("Updated Quiz 1", updatedQuiz.Title);
            Assert.Single(updatedQuiz.Rules);
            Assert.Equal(7, updatedQuiz.Rules.FirstOrDefault()?.Divisor);
        }

        [Fact]
        public async Task DeleteQuizAsync_ShouldDeleteQuiz_WhenAuthorized()
        {
            // Arrange
            _dbContext.Users.Add(new User { Id = 1, Email = "email@email.com" });
            await _dbContext.SaveChangesAsync();

            var rules = new List<CreateRuleRequest>
            {
                new CreateRuleRequest { Divisor = 3, Word = "Fizz" }
            };
            var quiz = await _quizService.CreateQuizAsync("Quiz 1", 1, rules);

            // Act
            await _quizService.DeleteQuizAsync(quiz.Id, 1);

            // Assert
            var deletedQuiz = await _quizService.GetQuizAsync(quiz.Id);
            Assert.Null(deletedQuiz);
        }
    }
}
