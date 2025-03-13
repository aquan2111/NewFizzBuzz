using System.Data;

namespace NewFizzBuzz.Api.Models;

public class Quiz
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;
    public ICollection<Rule> Rules { get; set; } = new List<Rule>();
    public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
}
