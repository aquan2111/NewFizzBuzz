using Microsoft.AspNetCore.Mvc;
using Moq;
using NewFizzBuzz.Api.Controllers;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using NewFizzBuzz.Api.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace NewFizzBuzz.Api.Tests.Controllers
{
    public class QuizControllerTests
    {
        private readonly NewFizzBuzzDbContext _dbContext;
        private readonly QuizController _quizController;
        private readonly QuizService _quizService;

        public QuizControllerTests()
        {
            // Create a new in-memory database for each test
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new NewFizzBuzzDbContext(options); // Use the in-memory database context
            _quizService = new QuizService(_dbContext); // Your service uses the same DbContext

            // Mocking the HttpContext and user authentication
            var mockHttpContext = new Mock<HttpContext>();
            var claimsIdentity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"), // Simulating a user with ID 1
                new Claim(ClaimTypes.Name, "testuser"),
                new Claim("UserId", "1") // Ensure that the UserId claim exists
            }, "mock");

            mockHttpContext.Setup(x => x.User).Returns(new ClaimsPrincipal(claimsIdentity));

            // Pass the mocked HttpContext to the controller
            _quizController = new QuizController(_dbContext, _quizService)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = mockHttpContext.Object
                }
            };
        }

        #region CreateQuiz
        [Fact]
        public async Task CreateQuiz_ShouldReturnCreatedQuiz_WhenValidRequest()
        {
            // Arrange: Create a new quiz request
            var request = new CreateQuizRequest
            {
                Title = "Test Quiz",
                Rules = new List<CreateRuleRequest>
                {
                    new CreateRuleRequest { Divisor = 3, Word = "Fizz" },
                    new CreateRuleRequest { Divisor = 5, Word = "Buzz" }
                }
            };

            // Act: Call the controller method to create a quiz
            var result = await _quizController.CreateQuiz(request);

            // Assert: Verify that the result is a CreatedAtActionResult
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnedQuiz = Assert.IsType<QuizDto>(createdResult.Value);
            Assert.Equal("Test Quiz", returnedQuiz.Title);
        }
        #endregion

        #region Other tests...

        // For GetQuiz, UpdateQuiz, DeleteQuiz, etc.
        // Add similar authentication mock handling if needed
        #endregion
    }
}
