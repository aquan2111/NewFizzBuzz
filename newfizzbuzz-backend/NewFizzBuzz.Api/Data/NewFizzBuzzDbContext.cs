using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Models;

namespace NewFizzBuzz.Api.Data;

public class NewFizzBuzzDbContext : DbContext
{
    public NewFizzBuzzDbContext(DbContextOptions<NewFizzBuzzDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<Rule> Rules { get; set; }
    public DbSet<Attempt> Attempts { get; set; }
    public DbSet<AttemptAnswer> AttemptAnswers { get; set; }
    public DbSet<QuizQuestion> QuizQuestions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Rule>()
            .HasIndex(r => new { r.QuizId, r.Divisor })
            .IsUnique();

        modelBuilder.Entity<Quiz>()
            .HasOne(q => q.Author)
            .WithMany(u => u.Quizzes)
            .HasForeignKey(q => q.AuthorId);

        modelBuilder.Entity<Attempt>()
            .HasOne(a => a.Quiz)
            .WithMany(q => q.Attempts)
            .HasForeignKey(a => a.QuizId);

        modelBuilder.Entity<QuizQuestion>().HasData(
            Enumerable.Range(1, 100).Select(i => new QuizQuestion { Id = i, Number = i }).ToArray()
        );
    }
}
