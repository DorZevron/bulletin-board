# Bulletin Board

לוח מודעות  - Angular + .NET, ללא Authentication אמיתי (משתמש דמו לפי GUID ב-`localStorage`).

## גרסאות

- .NET 8
- Angular 21 (standalone components, Reactive Forms, signals)
- Bootstrap 5.3 (SCSS)

## הרצה

**שרת** (מתוך `server/BulletinBoard.Api`):
```
dotnet run
```
רץ על `http://localhost:5273` (Swagger זמין ב-`/swagger`).

**לקוח** (מתוך `client/`):
```
npm install
ng serve
```
רץ על `http://localhost:4200`.

יש להריץ את השרת לפני הלקוח - הלקוח פונה ל-`http://localhost:5273/api` (מוגדר ב-`client/src/environments/environment.ts`).

## פיצ'רים

- CRUD מלא על מודעות (יצירה/עריכה/מחיקה/הצגה), עם בעלות (Ownership) לפי משתמש דמו.
- חיפוש וסינון (טקסט חופשי כולל כותרת, קטגוריה, טווח מחיר) עם debounce.
- תצוגת מפה (Google Maps Embed) לפי מודעה נבחרת.
- איתור מיקום נוכחי בטופס יצירה/עריכה (Geolocation API), עם Reverse Geocoding אוטומטי לכתובת (Nominatim).
- ממשק RTL מלא בעברית.

## מבנה

- `server/` - פתרון .NET (`BulletinBoard.Api` / `Domain` / `Application` / `Infrastructure`), נתונים נשמרים בקובץ JSON (`server/BulletinBoard.Api/Data/advertisements.json`).
- `client/` - Angular, קומפוננטות תחת `src/app/components/`.
