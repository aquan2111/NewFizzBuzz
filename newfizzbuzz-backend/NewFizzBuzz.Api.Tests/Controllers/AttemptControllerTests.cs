using Microsoft.EntityFrameworkCore;
using Moq;
using NewFizzBuzz.Api.Controllers;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using NewFizzBuzz.Api.Data;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;

namespace NewFizzBuzz.Api.Tests.Controllers
{
    public class AttemptControllerTests
    {
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Mock<ILogger<AttemptService>> _mockLogger;
        private readonly Mock<ILogger<AttemptController>> _mockControllerLogger;
        private readonly Mock<NewFizzBuzzDbContext> _mockDbContext;

        public AttemptControllerTests()
        {
            // Set up in-memory database options
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _mockDbContext = new Mock<NewFizzBuzzDbContext>(options);
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            _mockLogger = new Mock<ILogger<AttemptService>>();
            _mockControllerLogger = new Mock<ILogger<AttemptController>>();
        }

        // Test for GetAttemptsByUserAsync
        [Fact]
        public async Task GetAttemptsByUserAsync_ShouldReturnAttempts_WhenUserHasAttempts()
        {
            // Arrange: Setup test data
            var userId = 1;
            var mockAttempts = new List<Attempt>
            {
                new Attempt { Id = 1, UserId = userId, QuizId = 1, TotalQuestions = 10 }
            };

            // Create a real in-memory DbContext for this test
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new NewFizzBuzzDbContext(options);
            context.Attempts.AddRange(mockAttempts);
            await context.SaveChangesAsync();

            // Create real AttemptService with the test database
            var attemptService = new AttemptService(context, _mockHttpContextAccessor.Object, _mockLogger.Object);

            // Create controller with real service and test database
            var controller = new AttemptController(attemptService, _mockControllerLogger.Object, context);

            // Act
            var result = await controller.GetAttemptsByUserAsync(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var attempts = Assert.IsType<List<Attempt>>(okResult.Value);
            Assert.Single(attempts);
        }

        // Test for GetAttemptByIdAsync
        [Fact]
        public async Task GetAttemptByIdAsync_ShouldReturnAttempt_WhenExists()
        {
            // Arrange
            var attemptId = 1;
            var mockAttempt = new Attempt
            {
                Id = attemptId,
                AttemptAnswers = new List<AttemptAnswer> { new AttemptAnswer { Id = 1, AttemptId = attemptId } }
            };

            // Create a real in-memory DbContext for this test
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new NewFizzBuzzDbContext(options);
            context.Attempts.Add(mockAttempt);
            await context.SaveChangesAsync();

            // Use a manually stubbed AttemptService to avoid complex DB setup
            var stubAttemptService = new StubAttemptService(context, _mockHttpContextAccessor.Object, _mockLogger.Object)
            {
                GetAttemptByIdAsyncResult = mockAttempt
            };

            var controller = new AttemptController(stubAttemptService, _mockControllerLogger.Object, context);

            // Act
            var result = await controller.GetAttemptByIdAsync(attemptId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<Attempt>(okResult.Value);
            Assert.Equal(attemptId, returnValue.Id);
        }

        // Test for StartNewAttemptAsync
        [Fact]
        public async Task StartNewAttemptAsync_ShouldReturnNewAttempt_WhenQuizExists()
        {
            // Arrange
            var mockRequest = new StartAttemptRequest
            {
                QuizId = 1,
                TimeLimit = 30
            };

            var mockAttempt = new Attempt
            {
                Id = 1,
                AttemptAnswers = new List<AttemptAnswer>
        {
            new AttemptAnswer { QuizQuestionId = 1 },
            new AttemptAnswer { QuizQuestionId = 2 }
        }
            };

            // Create in-memory database
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new NewFizzBuzzDbContext(options);

            // Use a manually stubbed AttemptService
            var stubAttemptService = new StubAttemptService(context, _mockHttpContextAccessor.Object, _mockLogger.Object)
            {
                CreateAttemptAsyncResult = mockAttempt
            };

            var controller = new AttemptController(stubAttemptService, _mockControllerLogger.Object, context);

            // Mock the user claims
            var claims = new List<Claim> { new Claim("UserId", "1") };
            var identity = new ClaimsIdentity(claims, "mock");
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            // Act
            var result = await controller.StartNewAttemptAsync(mockRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Instead of using dynamic, convert to a specific type or use a more explicit approach
            var resultValue = okResult.Value;

            // Access with reflection or type-cast to avoid dynamic type issues
            var idProperty = resultValue.GetType().GetProperty("id");
            Assert.NotNull(idProperty);

            var actualId = idProperty.GetValue(resultValue);
            Assert.Equal(mockAttempt.Id, actualId);
        }

        // Test for SubmitAnswerAsync
        [Fact]
        public async Task SubmitAnswerAsync_ShouldReturnCorrectStatus_WhenAnswerIsSubmitted()
        {
            // Arrange
            var mockRequest = new SubmitAnswerRequest
            {
                AttemptId = 1,
                QuizQuestionId = 1,
                QuizId = 1,
                Answer = "Fizz"
            };

            // Create mock attempt
            var mockAttempt = new Attempt
            {
                Id = mockRequest.AttemptId,
                AttemptAnswers = new List<AttemptAnswer>
        {
            new AttemptAnswer { QuizQuestionId = mockRequest.QuizQuestionId, Answer = mockRequest.Answer }
        }
            };

            // Create in-memory database
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            using var context = new NewFizzBuzzDbContext(options);
            context.Attempts.Add(mockAttempt);
            await context.SaveChangesAsync();

            // Use a manually stubbed AttemptService
            var stubAttemptService = new StubAttemptService(context, _mockHttpContextAccessor.Object, _mockLogger.Object)
            {
                IsAnswerCorrectResult = true
            };

            var controller = new AttemptController(stubAttemptService, _mockControllerLogger.Object, context);

            // Act
            var result = await controller.SubmitAnswerAsync(mockRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Use reflection or explicit casting instead of dynamic
            var resultValue = okResult.Value;
            var isCorrectProperty = resultValue.GetType().GetProperty("isCorrect");
            Assert.NotNull(isCorrectProperty);

            var isCorrect = (bool)isCorrectProperty.GetValue(resultValue);
            Assert.True(isCorrect);
        }
    }

    // Helper stub class for testing without interfaces
    public class StubAttemptService : AttemptService
    {
        public Attempt GetAttemptByIdAsyncResult { get; set; }
        public Attempt CreateAttemptAsyncResult { get; set; }
        public bool IsAnswerCorrectResult { get; set; }

        public StubAttemptService(
            NewFizzBuzzDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AttemptService> logger)
            : base(context, httpContextAccessor, logger)
        {
        }

        public override Task<Attempt> GetAttemptByIdAsync(int attemptId)
        {
            return Task.FromResult(GetAttemptByIdAsyncResult);
        }

        public override Task<Attempt> CreateAttemptAsync(int quizId, int userId, int timeLimit)
        {
            return Task.FromResult(CreateAttemptAsyncResult);
        }

        public override bool IsAnswerCorrect(int quizQuestionId, int quizId, string answer)
        {
            return IsAnswerCorrectResult;
        }

        public override Task RecordAttemptAnswerAsync(int attemptId, int quizQuestionId, string answer, bool isCorrect)
        {
            return Task.CompletedTask;
        }
    }
}