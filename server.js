import express from "express";
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import axios from "axios";

// Configure paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
env.config();

// Middleware setup - ORDER IS CRUCIAL
app.use(cors());
app.use(express.json());

// Database connection (using Client as requested)
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});

// Connect to DB
db.connect()
  .then(() => console.log('Connected to Postgre database'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });


// API ROUTES (must come before static files)
// ==========================================

// Test route
app.get("/", async (req, res) => {
  res.send("<h1>Hello</h1>");
});




// Route to add a manga to the database
app.post("/adding-manga", async (req, res) => {
  try {
    // Deconstruct and store fields from request body
    const {
      title,
      lastChapterRead,
      lastReadDate,
      status,
      latestChapter,
      latestChapterDate,
      description,
      image,
      genres,
      tier,
      favorite, // Added favorite field
    } = req.body;

    // Convert chapter numbers to decimals
    const lastChapterReadDecimal = lastChapterRead ? parseFloat(lastChapterRead) : 0;
    const latestChapterDecimal = latestChapter ? parseFloat(latestChapter) : 0;

    // Ensure required fields are present
    if (!title) {
      return res.status(400).json({
        error: "Title is required",
        details: "No title was provided in the request body",
      });
    }

    // Start transaction
    await db.query("BEGIN");

    // Insert manga into the 'manga' table
    const mangaResult = await db.query(
      `INSERT INTO manga (
        title, 
        description,
        cover_art_url,
        status,
        latest_chapter,
        latest_chapter_date,
        tier,
        record_created
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
      RETURNING manga_id`,
      [
        title,
        description || null,
        image || null,
        status || null,
        latestChapterDecimal,
        latestChapterDate || null,
        tier || null
      ]
    );

    const mangaId = mangaResult.rows[0].manga_id;

    // Insert manga into the watchlist with decimal chapter and favorite status
    await db.query(
      `INSERT INTO watchlist (
        manga_id,
        last_chapter_read,
        date_added_to_watchlist,
        favorite
      ) VALUES ($1, $2, NOW(), $3)`,
      [mangaId, lastChapterReadDecimal, favorite || false]
    );

    // If manga has a status "WatchList", add it to the watchlist and update is_watched to true
    if (status === "WatchList") {
      try {
        await db.query(
          `UPDATE watchlist
           SET is_watched = true
           WHERE manga_id = $1`,
          [mangaId]
        );
      } catch (error) {
        console.error("Error updating watchlist or is_watched:", error);
        res.status(500).json({
          error: "Failed to add manga to watchlist or update is_watched",
          details: error.message,
        });
      }
    }

    // Insert genres if provided
    if (genres && genres.length > 0) {
      for (const genreName of genres) {
        const genreCheck = await db.query(
          "SELECT genre_id FROM genres WHERE genre_name = $1",
          [genreName]
        );

        let genreId;
        if (!genreCheck.rows.length) {
          const newGenre = await db.query(
            "INSERT INTO genres (genre_name) VALUES ($1) RETURNING genre_id",
            [genreName]
          );
          genreId = newGenre.rows[0].genre_id;
        } else {
          genreId = genreCheck.rows[0].genre_id;
        }

        await db.query(
          "INSERT INTO mangagenres (manga_id, genre_id) VALUES ($1, $2)",
          [mangaId, genreId]
        );
      }
    }

    await db.query("COMMIT");

    res.json({
      success: true,
      manga_id: mangaId,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("DB error:", error);
    res.status(500).json({
      error: "Failed to add manga",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Route to update manga details
app.patch("/api/manga/:manga_id", async (req, res) => {
	try {
	  const { manga_id } = req.params;
	  const updates = req.body;
  
	  if (!manga_id) {
		return res.status(400).json({
		  error: "Manga ID is required",
		  details: "No manga_id was provided in the URL parameters",
		});
	  }
  
	  if (!updates || Object.keys(updates).length === 0) {
		return res.status(400).json({
		  error: "No updates provided",
		  details: "Request body must contain at least one field to update",
		});
	  }
  
	  await db.query("BEGIN");
  
	  const mangaCheck = await db.query(
		"SELECT manga_id FROM manga WHERE manga_id = $1",
		[manga_id]
	  );
  
	  if (!mangaCheck.rows.length) {
		await db.query("ROLLBACK");
		return res.status(404).json({
		  error: "Manga not found",
		  details: `No manga found with ID ${manga_id}`,
		});
	  }
  
	  const mangaFields = [
		"title",
		"description",
		"cover_art_url",
		"status",
		"latest_chapter",
		"latest_chapter_date",
	  ];
  
	  const watchlistFields = ["last_chapter_read", "favorite", "read_list"];
  
	  const mangaUpdates = {};
	  for (const field of mangaFields) {
		if (updates[field] !== undefined) {
		  mangaUpdates[field] = updates[field];
		}
	  }
  
	  const watchlistUpdates = {};
	  for (const field of watchlistFields) {
		if (updates[field] !== undefined) {
		  watchlistUpdates[field] = updates[field];
		}
	  }
  
	  // === Update manga table ===
	  if (Object.keys(mangaUpdates).length > 0) {
		const keys = Object.keys(mangaUpdates);
		const values = Object.values(mangaUpdates);
  
		const setClause = keys
		  .map((key, i) => `${key} = $${i + 1}`)
		  .join(", ");
  
		const fullSetClause = setClause
		  ? `${setClause}, record_updated_date = NOW()`
		  : "record_updated_date = NOW()";
  
		values.push(manga_id);
  
		await db.query(
		  `UPDATE manga 
		   SET ${fullSetClause}
		   WHERE manga_id = $${values.length}`,
		  values
		);
  
		// Update is_watched status based on manga status
		if (mangaUpdates.status === "WatchList") {
		  await db.query(
			`UPDATE watchlist
			 SET is_watched = true
			 WHERE manga_id = $1`,
			[manga_id]
		  );
		} else if (mangaUpdates.status) {
		  await db.query(
			`UPDATE watchlist
			 SET is_watched = false
			 WHERE manga_id = $1`,
			[manga_id]
		  );
		}
	  }
  
	  // === Update watchlist table ===
	  if (Object.keys(watchlistUpdates).length > 0) {
		const keys = Object.keys(watchlistUpdates);
		const values = Object.values(watchlistUpdates);
  
		const setClause = keys
		  .map((key, i) => `${key} = $${i + 1}`)
		  .join(", ");
  
		values.push(manga_id);
  
		await db.query(
		  `UPDATE watchlist 
		   SET ${setClause}
		   WHERE manga_id = $${values.length}`,
		  values
		);
	  }
  
	  // === Handle genres ===
	  if (updates.genres !== undefined) {
		await db.query("DELETE FROM mangagenres WHERE manga_id = $1", [manga_id]);
  
		if (Array.isArray(updates.genres) && updates.genres.length > 0) {
		  for (const genreName of updates.genres) {
			const genreCheck = await db.query(
			  "SELECT genre_id FROM genres WHERE genre_name = $1",
			  [genreName]
			);
  
			let genreId;
			if (!genreCheck.rows.length) {
			  const newGenre = await db.query(
				"INSERT INTO genres (genre_name) VALUES ($1) RETURNING genre_id",
				[genreName]
			  );
			  genreId = newGenre.rows[0].genre_id;
			} else {
			  genreId = genreCheck.rows[0].genre_id;
			}
  
			await db.query(
			  "INSERT INTO mangagenres (manga_id, genre_id) VALUES ($1, $2)",
			  [manga_id, genreId]
			);
		  }
		}
	  }
  
	  await db.query("COMMIT");
  
	  const updatedManga = await db.query(
		`SELECT m.*, 
		  w.last_chapter_read,
		  w.date_added_to_watchlist,
		  w.is_watched,
		  w.read_list,
		  w.favorite,
		  ARRAY(
			SELECT g.genre_name 
			FROM genres g
			JOIN mangagenres mg ON g.genre_id = mg.genre_id
			WHERE mg.manga_id = m.manga_id
		  ) AS genres
		 FROM manga m
		 LEFT JOIN watchlist w ON m.manga_id = w.manga_id
		 WHERE m.manga_id = $1`,
		[manga_id]
	  );
  
	  res.json({
		success: true,
		manga: updatedManga.rows[0],
	  });
	} catch (error) {
	  await db.query("ROLLBACK");
	  console.error("Update error:", error);
	  res.status(500).json({
		error: "Failed to update manga",
		details: error.message,
		stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
	  });
	}
  });
  

// Updated GET endpoint with search functionality + favorites
app.get("/api/manga", async (req, res) => {
	console.log("Incoming request to /api/manga with query:", req.query);

	try {
		const {
			page = 1,
			limit = 10,
			genres = "",
			min_chapters = 0,
			sort = "newest",
			search = "",
		} = req.query;

		const offset = (page - 1) * limit;
		const genreList = genres ? genres.split(",") : [];
		const minChaptersNum = Number(min_chapters) || 0;

		const sortOptions = {
			"a-z": { field: "m.title", order: "ASC" },
			newest: { field: "m.record_created", order: "DESC" },
			updated: { field: "m.latest_chapter_date", order: "DESC" },
			chapters: { field: "COALESCE(m.latest_chapter, 0)", order: "DESC" },
			unread: {
				field:
					"(COALESCE(m.latest_chapter, 0) - COALESCE(w.last_chapter_read, 0))",
				order: "DESC",
			},
		};

		const currentSort = sortOptions[sort] || sortOptions.newest;

		let query = `
			SELECT 
				m.manga_id,
				m.title,
				m.alternative_title,
				m.cover_art_url,
				m.description,
				m.status,
				m.tier,
				CASE 
					WHEN COALESCE(m.latest_chapter, 0) % 1 = 0 THEN COALESCE(m.latest_chapter, 0)::integer::text
					ELSE TRIM(TRAILING '0' FROM COALESCE(m.latest_chapter, 0)::text)
				END as latest_chapter,
				m.latest_chapter_date,
				CASE 
					WHEN COALESCE(w.last_chapter_read, 0) % 1 = 0 THEN COALESCE(w.last_chapter_read, 0)::integer::text
					ELSE TRIM(TRAILING '0' FROM COALESCE(w.last_chapter_read, 0)::text)
				END as last_chapter_read,
				w.date_added_to_watchlist,
				w.favorite,  -- ✅ Added favorite field
				COUNT(*) OVER() as total_count
			FROM manga m
			LEFT JOIN watchlist w ON m.manga_id = w.manga_id
		`;

		const whereClauses = [];
		const queryParams = [];

		if (search) {
			whereClauses.push(`
				(m.title ILIKE $${queryParams.length + 1} OR 
				m.alternative_title ILIKE $${queryParams.length + 1} OR
				m.description ILIKE $${queryParams.length + 1})
			`);
			queryParams.push(`%${search}%`);
		}

		if (genreList.length > 0) {
			whereClauses.push(`
				m.manga_id IN (
					SELECT mg.manga_id 
					FROM mangagenres mg
					JOIN genres g ON mg.genre_id = g.genre_id
					WHERE g.genre_name = ANY($${queryParams.length + 1})
				)
			`);
			queryParams.push(genreList);
		}

		if (minChaptersNum > 0) {
			whereClauses.push(`m.latest_chapter >= $${queryParams.length + 1}`);
			queryParams.push(minChaptersNum);
		}

		if (whereClauses.length > 0) {
			query += " WHERE " + whereClauses.join(" AND ");
		}

		query += ` ORDER BY ${currentSort.field} ${currentSort.order}`;
		queryParams.push(limit, offset);
		query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

		const { rows } = await db.query(query, queryParams);

		res.json({
			success: true,
			data: rows,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total: rows[0]?.total_count || 0,
				totalPages: Math.ceil((rows[0]?.total_count || 0) / limit)
			}
		});
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			success: false,
			error: "Failed to fetch manga",
			details: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
});


// GET endpoint to retrieve user's watchlist
app.get("/api/watchlist", async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;

		const query = `
			SELECT 
				m.manga_id,
				m.title,
				m.alternative_title,
				m.cover_art_url,
				m.description,
				m.status,
				m.tier,
				CASE 
					WHEN COALESCE(m.latest_chapter, 0) % 1 = 0 THEN COALESCE(m.latest_chapter, 0)::integer::text
					ELSE TRIM(TRAILING '0' FROM COALESCE(m.latest_chapter, 0)::text)
				END as latest_chapter,
				m.latest_chapter_date,
				CASE 
					WHEN COALESCE(w.last_chapter_read, 0) % 1 = 0 THEN COALESCE(w.last_chapter_read, 0)::integer::text
					ELSE TRIM(TRAILING '0' FROM COALESCE(w.last_chapter_read, 0)::text)
				END as last_chapter_read,
				w.date_added_to_watchlist,
				w.is_watched,
				w.favorite, -- ← Include favorite here
				COUNT(*) OVER() as total_count
			FROM manga m
			JOIN watchlist w ON m.manga_id = w.manga_id
			WHERE w.is_watched = true
			ORDER BY w.date_added_to_watchlist DESC
			LIMIT $1 OFFSET $2
		`;

		const { rows } = await db.query(query, [limit, offset]);

		res.json({
			success: true,
			data: rows,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total: rows[0]?.total_count || 0,
			},
		});
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			success: false,
			error: "Failed to fetch watchlist",
			details: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
});

app.get("/api/favorites", async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const offset = (page - 1) * limit;

		const query = `
		SELECT 
			m.manga_id,
			m.title,
			m.alternative_title,
			m.cover_art_url,
			m.description,
			m.status,
			m.tier,
			CASE 
			WHEN COALESCE(m.latest_chapter, 0) % 1 = 0 THEN COALESCE(m.latest_chapter, 0)::integer::text
			ELSE TRIM(TRAILING '0' FROM COALESCE(m.latest_chapter, 0)::text)
			END as latest_chapter,
			m.latest_chapter_date,
			COUNT(*) OVER() as total_count
		FROM manga m
		JOIN watchlist w ON m.manga_id = w.manga_id
		WHERE w.favorite = true
		ORDER BY w.date_added_to_watchlist DESC
		LIMIT $1 OFFSET $2
		`;

		const { rows } = await db.query(query, [limit, offset]);

		// Log the mangas retrieved for debugging
		console.log(`Fetched favorite mangas (page: ${page}, limit: ${limit}):`);
		rows.forEach(manga => {
		console.log(`- [${manga.manga_id}] ${manga.title} (Favorite: true)`);
		});

		res.json({
		success: true,
		data: rows,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total: rows[0]?.total_count || 0,
		},
		});
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
		success: false,
		error: "Failed to fetch favorites",
		details: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
	});

app.get("/api/readlist", async (req, res) => {
try {
	const { page = 1, limit = 10 } = req.query;
	const offset = (page - 1) * limit;

	const query = `
	SELECT 
		m.manga_id,
		m.title,
		m.alternative_title,
		m.cover_art_url,
		m.description,
		m.status,
		m.tier,
		CASE 
		WHEN COALESCE(m.latest_chapter, 0) % 1 = 0 THEN COALESCE(m.latest_chapter, 0)::integer::text
		ELSE TRIM(TRAILING '0' FROM COALESCE(m.latest_chapter, 0)::text)
		END as latest_chapter,
		m.latest_chapter_date,
		COUNT(*) OVER() as total_count
	FROM manga m
	JOIN watchlist w ON m.manga_id = w.manga_id
	WHERE w.read_list = true
	ORDER BY w.date_added_to_watchlist DESC
	LIMIT $1 OFFSET $2
	`;

	const { rows } = await db.query(query, [limit, offset]);

	// Log the mangas retrieved for debugging
	console.log(`Fetched read list mangas (page: ${page}, limit: ${limit}):`);
	rows.forEach(manga => {
	console.log(`- [${manga.manga_id}] ${manga.title} (read: true)`);
	});

	res.json({
	success: true,
	data: rows,
	pagination: {
		page: Number(page),
		limit: Number(limit),
		total: rows[0]?.total_count || 0,
	},
	});
} catch (err) {
	console.error("Database error:", err);
	res.status(500).json({
	success: false,
	error: "Failed to fetch favorites",
	details: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
}
});


// GET endpoint for individual manga details by ID
app.get("/api/manga/:id", async (req, res) => {
	try {
	  const mangaId = req.params.id;
  
	  // Fetch main manga info with favorite status
	  const mangaQuery = `
		SELECT 
		  m.manga_id,
		  m.title,
		  m.alternative_title,
		  m.description,
		  m.cover_art_url,
		  m.status,
		  m.tier,
		  m.latest_chapter,
		  m.latest_chapter_date,
		  m.year_published,
		  m.record_created,
		  m.record_updated_date,
		  w.favorite,
		  w.last_chapter_read,
		  w.date_added_to_watchlist,
		  w.read_list,
		  w.is_watched,
		  CASE 
			WHEN COALESCE(w.last_chapter_read, 0) % 1 = 0 THEN COALESCE(w.last_chapter_read, 0)::integer::text
			ELSE TRIM(TRAILING '0' FROM COALESCE(w.last_chapter_read, 0)::text)
		  END as formatted_last_chapter_read,
		  CASE 
			WHEN COALESCE(m.latest_chapter, 0) % 1 = 0 THEN COALESCE(m.latest_chapter, 0)::integer::text
			ELSE TRIM(TRAILING '0' FROM COALESCE(m.latest_chapter, 0)::text)
		  END as formatted_latest_chapter
		FROM manga m
		LEFT JOIN watchlist w ON m.manga_id = w.manga_id
		WHERE m.manga_id = $1
	  `;
  
	  const mangaResult = await db.query(mangaQuery, [mangaId]);
  
	  if (mangaResult.rows.length === 0) {
		return res.status(404).json({ error: "Manga not found" });
	  }
  
	  // Fetch genres
	  const genresQuery = `
		SELECT g.genre_id, g.genre_name
		FROM genres g
		JOIN mangagenres mg ON g.genre_id = mg.genre_id
		WHERE mg.manga_id = $1
	  `;
  
	  const genresResult = await db.query(genresQuery, [mangaId]);
  
	  // Format the response
	  const mangaData = mangaResult.rows[0];
	  const response = {
		...mangaData,
		last_chapter_read: mangaData.formatted_last_chapter_read,
		latest_chapter: mangaData.formatted_latest_chapter,
		genres: genresResult.rows,
		favorite: mangaData.favorite || false, // Default to false if null
		read_list: mangaData.read_list || false
	  };
  
	  // Remove temporary formatted fields
	  delete response.formatted_last_chapter_read;
	  delete response.formatted_latest_chapter;
  
	  res.json(response);
	} catch (err) {
	  console.error("Database error:", err);
	  res.status(500).json({
		error: "Failed to fetch manga details",
		details: process.env.NODE_ENV === "development" ? err.message : undefined,
	  });
	}
  });

// DELETE endpoint to remove manga by ID
app.delete("/api/manga/:id", async (req, res) => {
	try {
		const result = await db.query(
			"DELETE FROM manga WHERE manga_id = $1 RETURNING *",
			[req.params.id]
		);

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Manga not found" });
		}

		res.json({
			success: true,
			deleted: result.rows[0],
		});
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to delete manga",
			details: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
});

// Add this to your server.js (before app.listen)
app.get("/api/genres", async (req, res) => {
	try {
		// Simple query to get all genres sorted by name
		const result = await db.query(`
      SELECT genre_id, genre_name 
      FROM genres 
      ORDER BY genre_name ASC
    `);

		// Log the query result for debugging
		console.log("Genres fetched:", result.rows);

		// Return the genres array
		res.json(result.rows);
	} catch (err) {
		console.error("Error fetching genres:", err);
		res.status(500).json({
			error: "Failed to fetch genres",
			details: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
});

// Add this to your server.js (before app.listen)
app.post("/api/genres", async (req, res) => {
	const { genre_name } = req.body;

	// Ensure the genre name is provided
	if (!genre_name) {
		return res.status(400).json({ error: "Genre name is required" });
	}

	try {
		// Insert new genre into the Genres table
		const result = await db.query(
			`
      INSERT INTO genres (genre_name) 
      VALUES ($1) 
      RETURNING genre_id, genre_name;
    `,
			[genre_name]
		);

		// Log the result for debugging
		console.log("New genre added:", result.rows[0]);

		// Return the newly added genre
		res.status(201).json(result.rows[0]);
	} catch (err) {
		console.error("Error adding genre:", err);
		res.status(500).json({
			error: "Failed to add genre",
			details: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
});

app.put("/api/genres/:name", async (req, res) => {
	const rawGenreName = req.params.name;
	const genreName = decodeURIComponent(rawGenreName);
	const { genre_name: newGenreName } = req.body;

	if (!newGenreName || !genreName) {
		return res
			.status(400)
			.json({ error: "Both current and new genre names are required" });
	}

	try {
		await db.query("BEGIN");

		// Check if genre exists
		const checkQuery = "SELECT genre_id FROM genres WHERE genre_name = $1";
		const checkResult = await db.query(checkQuery, [genreName]);

		if (checkResult.rowCount === 0) {
			await db.query("ROLLBACK");
			return res.status(404).json({ error: "Genre not found" });
		}

		const genreId = checkResult.rows[0].genre_id;

		// Check if new name already exists
		const existsQuery =
			"SELECT genre_id FROM genres WHERE genre_name = $1 AND genre_id != $2";
		const existsResult = await db.query(existsQuery, [newGenreName, genreId]);

		if (existsResult.rowCount > 0) {
			await db.query("ROLLBACK");
			return res.status(409).json({ error: "Genre name already exists" });
		}

		// Update genre
		const updateQuery = `
      UPDATE genres 
      SET genre_name = $1 
      WHERE genre_id = $2 
      RETURNING genre_id, genre_name
    `;
		const updateResult = await db.query(updateQuery, [newGenreName, genreId]);

		await db.query("COMMIT");

		res.status(200).json(updateResult.rows[0]);
	} catch (err) {
		await db.query("ROLLBACK");
		console.error("Error updating genre:", err);
		res.status(500).json({
			error: "Failed to update genre",
			details: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
});

app.delete("/api/genres/:name", async (req, res) => {
	const rawGenreName = req.params.name;
	const genreName = decodeURIComponent(rawGenreName);

	try {
		await db.query("BEGIN");

		// Check if genre exists
		const checkQuery = "SELECT genre_id FROM genres WHERE genre_name = $1";
		const checkResult = await db.query(checkQuery, [genreName]);

		if (checkResult.rowCount === 0) {
			await db.query("ROLLBACK");
			return res.status(404).json({ error: "Genre not found" });
		}

		const genreId = checkResult.rows[0].genre_id;

		// Remove references in mangagenres (or any related table)
		const deleteReferencesQuery = "DELETE FROM mangagenres WHERE genre_id = $1";
		await db.query(deleteReferencesQuery, [genreId]);

		// Delete the genre itself
		const deleteGenreQuery = "DELETE FROM genres WHERE genre_id = $1";
		await db.query(deleteGenreQuery, [genreId]);

		await db.query("COMMIT");

		res
			.status(200)
			.json({ message: `Genre "${genreName}" deleted successfully` });
	} catch (err) {
		await db.query("ROLLBACK");
		console.error("Error deleting genre:", err);
		res.status(500).json({
			error: "Failed to delete genre",
			details: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
});

// New endpoint for updating tier
app.patch("/api/manga/:id/tier", async (req, res) => {
	try {
	  const { id } = req.params;
	  const { tier } = req.body;
  
	  await db.query(
		`UPDATE manga SET tier = $1 WHERE manga_id = $2`,
		[tier, id]
	  );
  
	  res.json({ 
		success: true,
		message: "Tier updated successfully"
	  });
	  
	} catch (err) {
	  console.error("Error updating tier:", err);
	  res.status(500).json({
		success: false,
		error: "Failed to update tier"
	  });
	}
  });

// Serve static files from the dist directory (Vite output)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing, return index.html for all unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});