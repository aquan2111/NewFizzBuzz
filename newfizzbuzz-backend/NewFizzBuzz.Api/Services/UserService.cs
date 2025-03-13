using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Data;
using NewFizzBuzz.Api.Models;
using System.Threading.Tasks;

namespace NewFizzBuzz.Api.Services
{
    public class UserService
    {
        private readonly NewFizzBuzzDbContext _context;

        public UserService(NewFizzBuzzDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }
    }
}
