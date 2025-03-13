namespace NewFizzBuzz.Api.Models
{
    public class SubmitAnswerRequest
    {
        public int AttemptId { get; set; }
        public int QuizQuestionId { get; set; }
        public string Answer { get; set; }
        public int QuizId { get; set; }
    }
}
