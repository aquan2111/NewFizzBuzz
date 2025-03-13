using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using Xunit;

namespace NewFizzBuzz.Api.Tests.Services
{
    public class UserServiceTests
    {
        private readonly UserService _userService;
        private readonly NewFizzBuzzDbContext _dbContext;

        public UserServiceTests()
        {
            // Create an in-memory database context
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new NewFizzBuzzDbContext(options);
            _userService = new UserService(_dbContext);
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var userId = 1;
            var user = new User { Id = userId, Email = "test@example.com", Password = "Password123" };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _userService.GetUserByIdAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result?.Id);
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Arrange
            var userId = 999; // Non-existing user

            // Act
            var result = await _userService.GetUserByIdAsync(userId);

            // Assert
            Assert.Null(result);
        }
    }
}
