using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Controllers;
using NewFizzBuzz.Api.Models;
using NewFizzBuzz.Api.Services;
using NewFizzBuzz.Api.Data;
using System.Threading.Tasks;
using Xunit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using System.Dynamic;

namespace NewFizzBuzz.Api.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly AuthController _controller;
        private readonly NewFizzBuzzDbContext _dbContext;

        public AuthControllerTests()
        {
            // Create an in-memory database context
            var options = new DbContextOptionsBuilder<NewFizzBuzzDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new NewFizzBuzzDbContext(options);

            // Initialize the AuthService with the in-memory database
            var authService = new AuthService(_dbContext, new ConfigurationMock());
            _controller = new AuthController(authService);
        }

        // Test for the Register endpoint
        [Fact]
        public async Task Register_ShouldReturnOk_WhenUserIsSuccessfullyRegistered()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Email = "newuser@example.com",
                Password = "Password123"
            };

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("User registered successfully.", actionResult.Value);
        }

        [Fact]
        public async Task Register_ShouldReturnBadRequest_WhenUsernameAlreadyExists()
        {
            // Arrange
            var existingUser = new User { Email = "existinguser@example.com", Password = "HashedPassword" };
            _dbContext.Users.Add(existingUser);
            await _dbContext.SaveChangesAsync();

            var registerRequest = new RegisterRequest
            {
                Email = "existinguser@example.com",
                Password = "Password123"
            };

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var actionResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Username already exists.", actionResult.Value);
        }

        // Test for the Login endpoint
        [Fact]
        public async Task Login_ShouldReturnOk_WhenLoginIsSuccessful()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "testuser@example.com",
                Password = "Password123"
            };

            var user = new User
            {
                Id = 1,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            // Act
            var result = await _controller.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Instead of using dynamic, cast to a specific type or use reflection
            var resultValue = okResult.Value as object;
            var tokenProperty = resultValue.GetType().GetProperty("Token");

            Assert.NotNull(tokenProperty); // Ensure the Token property exists
            var token = tokenProperty.GetValue(resultValue);
            Assert.NotNull(token); // Ensure the token value is not null
            Assert.IsType<string>(token); // Assert that it's a string
            Assert.False(string.IsNullOrEmpty(token as string)); // Ensure the token is not empty
        }

        [Fact]
        public async Task Login_ShouldReturnUnauthorized_WhenInvalidLogin()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "invaliduser@example.com",
                Password = "WrongPassword"
            };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var actionResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid username or password.", actionResult.Value);
        }
    }

    // Mock IConfiguration for JwtSettings
    public class ConfigurationMock : Microsoft.Extensions.Configuration.IConfiguration
    {
        public string this[string key]
        {
            get
            {
                return key switch
                {
                    "JwtSettings:Key" => "eziA8NLv3jqlNEhkhlS6gcNTkKTNxFDrB3K9GVKkVls=",  // This is the key used in the AuthService
                    "JwtSettings:Issuer" => "NewFizzBuzz",
                    "JwtSettings:Audience" => "NewFizzBuzzUsers",
                    _ => null
                };
            }
            set { }  // Implement set to avoid the error, but it does nothing
        }

        // Other members of IConfiguration can be left unimplemented for testing
        public IChangeToken GetReloadToken() => null;
        public IConfigurationSection GetSection(string key) => null;
        public IEnumerable<IConfigurationSection> GetChildren() => null;
    }

}
