# שלב 1: בנייה (שימוש ב-SDK הכבד)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# העתקת קבצי הגדרות והורדת ספריות (Caching)
COPY *.csproj ./
RUN dotnet restore

# העתקת שאר הקוד ובנייה
COPY . ./
RUN dotnet publish -c Release -o out

# שלב 2: הרצה (שימוש ב-Runtime הקל)
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 80
ENTRYPOINT ["dotnet", "TodoApi.dll"]
