namespace NewFizzBuzz.Api.Models
{
    public class AttemptAnswer
    {
        public int Id { get; set; }
        public int AttemptId { get; set; }
        public Attempt Attempt { get; set; } = null!;
        public int QuizQuestionId { get; set; }  // Foreign Key to QuizQuestion
        public QuizQuestion QuizQuestion { get; set; } = null!;  // Navigation property to QuizQuestion
        public string Answer { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
