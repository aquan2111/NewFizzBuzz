using System.Text.Json.Serialization;
namespace NewFizzBuzz.Api.Models;

public class Rule
{
    public int Id { get; set; }
    public int QuizId { get; set; }
    [JsonIgnore]
    public Quiz Quiz { get; set; } = null!;
    public int Divisor { get; set; }
    public string Word { get; set; } = string.Empty;
}
