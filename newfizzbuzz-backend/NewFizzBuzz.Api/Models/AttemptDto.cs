namespace NewFizzBuzz.Api.Models
{
    public class AttemptDto
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Links attempt to a user
        public int QuizId { get; set; } // Links attempt to a quiz
        public DateTime AttemptedAt { get; set; } // Timestamp of the attempt
        public int CorrectCount { get; set; } // Number of correct answers
        public int TotalQuestions { get; set; } // Total questions in attempt
        public int TimeLimit { get; set; }


        // List of attempt answers (avoiding circular reference)
        public List<AttemptAnswerDto> AttemptAnswers { get; set; } = new List<AttemptAnswerDto>();
    }
}
