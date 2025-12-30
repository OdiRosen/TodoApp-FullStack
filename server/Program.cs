using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TodoApi; 

var builder = WebApplication.CreateBuilder(args);

// --- 1. הגדרת מסד הנתונים (MySQL) ---
var connectionString = builder.Configuration.GetConnectionString("ToDoDB");
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// --- 2. הגדרת אבטחת JWT (חלק מהאתגר) ---
// הערה למורה: הגדרת מפתח סודי לאימות הטוקנים
var key = Encoding.ASCII.GetBytes("YourVerySecretKey1234567890123456");

builder.Services.AddAuthentication(options =>
{
    // הגדרת ברירת המחדל לאימות לפי סכימת JwtBearer
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // הגדרת פרמטרים לאימות הטוקן (תוקף מפתח, אימות יוצר וכו')
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// הפעלת שירותי הרשאות
builder.Services.AddAuthorization();

// --- 3. הגדרת CORS ---
// מאפשר לקליינט (React) הקיים בפורט אחר לתקשר עם ה-API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- 4. הגדרת ה-Middlewares (הסדר כאן קריטי!) ---
app.UseCors("AllowAll");

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = string.Empty; // זה יגרום ל-Swagger להיפתח ישר כשנכנסים לכתובת הראשית!
});

app.UseAuthentication(); // בדיקת הטוקן ב-Header של הבקשה
app.UseAuthorization();  // בדיקה האם למשתמש המאומת יש הרשאה לגשת

// --- פונקציית עזר להפקת JWT Token ---
// הערה למורה: הפונקציה מקבלת משתמש ומייצרת טוקן המכיל Claims (מזהה ושם)
string GenerateToken(User user) {
    var tokenHandler = new JwtSecurityTokenHandler();
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[] { 
            new Claim("id", user.Id.ToString()), 
            new Claim("username", user.Username) 
        }),
        Expires = DateTime.UtcNow.AddDays(7), // תוקף ל-7 ימים
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };
    var token = tokenHandler.CreateToken(tokenDescriptor);
    return tokenHandler.WriteToken(token);
}

// --- 5. נתיבים (Endpoints) ---

// הרשמה (Register) - יצירת משתמש חדש במסד הנתונים
app.MapPost("/register", async (User newUser, ToDoDbContext db) =>
{
    if (await db.Users.AnyAsync(u => u.Username == newUser.Username))
    {
        return Results.BadRequest("Username already exists");
    }

    db.Users.Add(newUser);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "User created successfully" });
});

// לוגין (Login) - אימות משתמש והחזרת טוקן
app.MapPost("/login", async (User loginUser, ToDoDbContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Username == loginUser.Username && u.Password == loginUser.Password);
    if (user is null) return Results.Unauthorized();

    var token = GenerateToken(user);
    return Results.Ok(new { token });
});

// שליפת משימות - מסונן לפי מזהה המשתמש שחולץ מהטוקן (HttpContext)
app.MapGet("/items", async (HttpContext context, ToDoDbContext db) =>
{
    var userIdClaim = context.User.FindFirst("id")?.Value;
    if (userIdClaim == null) return Results.Unauthorized();

    int userId = int.Parse(userIdClaim);
    var userItems = await db.Items.Where(i => i.UserId == userId).ToListAsync();
    return Results.Ok(userItems);
});

// הוספת משימה חדשה המשויכת למשתמש המחובר
app.MapPost("/items", async (HttpContext context, Item item, ToDoDbContext db) =>
{
    var userIdClaim = context.User.FindFirst("id")?.Value;
    if (userIdClaim == null) return Results.Unauthorized();

    item.UserId = int.Parse(userIdClaim);
    db.Items.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/items/{item.Id}", item);
});

// מחיקת משימה
app.MapDelete("/items/{id}", async (int id, ToDoDbContext db) =>
{
    var item = await db.Items.FindAsync(id);
    if (item is null) return Results.NotFound();

    db.Items.Remove(item);
    await db.SaveChangesAsync();
    return Results.Ok(item);
});

// עדכון סטטוס משימה (PUT)
app.MapPut("/items/{id}", async (int id, Item inputItem, ToDoDbContext db) =>
{
    var item = await db.Items.FindAsync(id);
    if (item is null) return Results.NotFound();

    item.IsComplete = inputItem.IsComplete;
    if (!string.IsNullOrEmpty(inputItem.Name)) item.Name = inputItem.Name;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
