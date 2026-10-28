var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.SampleApp_Api>("api", launchProfileName: "https")
    .WithHttpHealthCheck("/health");

builder.AddViteApp("web", "../..")
    .WithReference(api)
    .WaitFor(api)
    .WithEnvironment("NODE_USE_SYSTEM_CA", "1");

builder.Build().Run();
