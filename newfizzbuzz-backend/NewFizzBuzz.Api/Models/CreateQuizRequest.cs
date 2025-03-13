namespace NewFizzBuzz.Api.Models
{
    public class CreateQuizRequest
    {
        public string Title { get; set; } = string.Empty;
        public List<CreateRuleRequest> Rules { get; set; } = new List<CreateRuleRequest>();
    }
}
