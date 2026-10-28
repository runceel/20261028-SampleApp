using Sales.Endpoints;
using Sales.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
        context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
});
builder.Services.AddSalesInfrastructure();

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapSalesEndpoints();
app.MapDefaultEndpoints();
app.Run();
