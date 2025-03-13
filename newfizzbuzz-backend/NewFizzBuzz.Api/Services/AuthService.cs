using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace NewFizzBuzz.Api.Services
{
    public class AuthService
    {
        private readonly NewFizzBuzzDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(NewFizzBuzzDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<bool> Register(string username, string password)
        {
            if (await _context.Users.AnyAsync(u => u.Email == username))
                return false; // User already exists

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User { Email = username, Password = hashedPassword };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string?> Login(string username, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
                return null; // Invalid login

            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]!));  // Fetch key from configuration
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim("UserId", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                _configuration["JwtSettings:Issuer"],  // Make sure issuer is correct
                _configuration["JwtSettings:Audience"],  // Make sure audience is correct
                claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        public async Task<User?> GetUserByIdAsync(int userId)
        {
            try
            {
                return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error fetching user by ID: {ex.Message}");
                throw;  // Re-throw for better diagnostics
            }
        }

    }
}
