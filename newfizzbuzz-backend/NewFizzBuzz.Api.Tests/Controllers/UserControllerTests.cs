using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using NewFizzBuzz.Api.Controllers;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using NewFizzBuzz.Api.Data;
using System.Threading.Tasks;
using Xunit;

namespace NewFizzBuzz.Api.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly UserController _controller;
        private readonly NewFizzBuzzDbContext _dbContext;

        public UserControllerTests()
        {
            // Create an in-memory database context
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new NewFizzBuzzDbContext(options);

            // Seed the database with test data
            _dbContext.Users.Add(new User { Id = 1, Email = "testuser@example.com", Password = "HashedPassword" });
            _dbContext.SaveChanges();

            var userService = new UserService(_dbContext);
            _controller = new UserController(userService);
        }

        [Fact]
        public async Task GetUserById_ShouldReturnOk_WhenUserExists()
        {
            // Arrange
            var userId = 1;

            // Act
            var result = await _controller.GetUserById(userId);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result);
            var returnedUser = Assert.IsType<User>(actionResult.Value);
            Assert.Equal(userId, returnedUser.Id);
            Assert.Equal("testuser@example.com", returnedUser.Email);
        }

        [Fact]
        public async Task GetUserById_ShouldReturnNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            var userId = 999;

            // Act
            var result = await _controller.GetUserById(userId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
