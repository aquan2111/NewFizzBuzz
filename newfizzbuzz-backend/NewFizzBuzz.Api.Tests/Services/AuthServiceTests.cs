using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using Xunit;
using BCrypt.Net;
using System;

namespace NewFizzBuzz.Api.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly AuthService _authService;
        private readonly NewFizzBuzzDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public AuthServiceTests()
        {
            // Create an in-memory database context
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new NewFizzBuzzDbContext(options);

            // In-memory configuration setup for JWT settings
            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    { "JwtSettings:Key", "eziA8NLv3jqlNEhkhlS6gcNTkKTNxFDrB3K9GVKkVls=" },
                    { "JwtSettings:Issuer", "NewFizzBuzz" },
                    { "JwtSettings:Audience", "NewFizzBuzzUsers" }
                })
                .Build();

            // Initialize AuthService with in-memory database and configuration
            _authService = new AuthService(_dbContext, _configuration);
        }

        [Fact]
        public async Task Register_ShouldReturnTrue_WhenUserIsSuccessfullyRegistered()
        {
            // Arrange
            var username = "newuser@example.com";
            var password = "Password123";

            // Act
            var result = await _authService.Register(username, password);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task Register_ShouldReturnFalse_WhenUserAlreadyExists()
        {
            // Arrange
            var username = "existinguser@example.com";
            var password = "Password123";

            var existingUser = new User { Email = username, Password = "Password123" };
            _dbContext.Users.Add(existingUser);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _authService.Register(username, password);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Login_ShouldReturnJwtToken_WhenLoginIsSuccessful()
        {
            // Arrange
            var username = "testuser@example.com";
            var password = "Password123";

            var user = new User { Id = 1, Email = username, Password = BCrypt.Net.BCrypt.HashPassword(password) };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _authService.Login(username, password);

            // Assert
            Assert.NotNull(result); // Ensure a JWT token is returned
        }

        [Fact]
        public async Task Login_ShouldReturnNull_WhenInvalidLogin()
        {
            // Arrange
            var username = "testuser@example.com";
            var password = "wrongPassword";

            // Act
            var result = await _authService.Login(username, password);

            // Assert
            Assert.Null(result); // Ensure null is returned if login fails
        }
    }
}
