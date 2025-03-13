namespace NewFizzBuzz.Api.Models
{
    public class StartAttemptRequest
    {
        public int QuizId { get; set; }
        public int UserId { get; set; }
        public int TimeLimit { get; set; } // Time limit for the game in seconds
    }
}
