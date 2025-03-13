namespace NewFizzBuzz.Api.Models
{
    public class RuleDto
    {
        public int Id { get; set; }
        public int Divisor { get; set; }
        public string Word { get; set; } = string.Empty;
    }
}
