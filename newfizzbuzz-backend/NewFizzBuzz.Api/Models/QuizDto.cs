namespace NewFizzBuzz.Api.Models
{
    public class QuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public List<RuleDto> Rules { get; set; } = new List<RuleDto>();
    }
}
