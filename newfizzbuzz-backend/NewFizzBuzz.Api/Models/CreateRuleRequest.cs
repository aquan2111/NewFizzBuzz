namespace NewFizzBuzz.Api.Models
{
    public class CreateRuleRequest
    {
        public int Divisor { get; set; }
        public string Word { get; set; } = string.Empty;
    }
}
