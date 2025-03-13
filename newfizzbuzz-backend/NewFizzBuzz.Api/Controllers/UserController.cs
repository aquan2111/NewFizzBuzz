using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NewFizzBuzz.Api.Services;
using System.Threading.Tasks;

namespace NewFizzBuzz.Api.Controllers
{
    [Route("api/user")]
    [ApiController]
    [Authorize] // Ensures only logged-in users can access this
    public class UserController : ControllerBase
    {
        private readonly UserService _userService; // Use concrete class

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        // GET api/user/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(); // 404 if user doesn't exist
            }
            return Ok(user); // 200 OK with user details
        }
    }
}
