using System.ComponentModel.DataAnnotations;

namespace NewFizzBuzz.Api.Models;

public class User
{
    public int Id { get; set; }
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;

    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
