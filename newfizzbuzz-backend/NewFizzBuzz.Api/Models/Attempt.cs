using NewFizzBuzz.Api.Models;

public class Attempt
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public int TimeLimit { get; set; }

    // New relationship to AttemptAnswer
    public List<AttemptAnswer> AttemptAnswers { get; set; } = new List<AttemptAnswer>();
}
