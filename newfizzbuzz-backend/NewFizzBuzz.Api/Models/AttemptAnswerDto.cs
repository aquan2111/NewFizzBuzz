namespace NewFizzBuzz.Api.Models
{
    public class AttemptAnswerDto
    {
        public int Id { get; set; }  // Unique identifier of the answer
        public int AttemptId { get; set; } // Links answer to attempt
        public int Number { get; set; } // The number being answered
        public string Answer { get; set; } = string.Empty; // User's answer
        public bool IsCorrect { get; set; } // Whether the answer is correct
    }
}
