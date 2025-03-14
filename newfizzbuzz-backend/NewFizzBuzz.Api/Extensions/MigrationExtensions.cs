using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using NewFizzBuzz.Api.Data;

namespace NewFizzBuzz.Api.Extensions
{
    public static class MigrationExtensions
    {
        public static void ApplyMigrations(this IApplicationBuilder app)
        {
            using IServiceScope scope = app.ApplicationServices.CreateScope();
            using NewFizzBuzzDbContext dbContext =
                scope.ServiceProvider.GetRequiredService<NewFizzBuzzDbContext>();
            dbContext.Database.Migrate();
        }
    }
}
