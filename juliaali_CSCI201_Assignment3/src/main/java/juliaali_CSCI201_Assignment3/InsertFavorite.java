package juliaali_CSCI201_Assignment3;

import java.io.*;
import java.sql.*;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/insertFavorite")
public class InsertFavorite extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String email = request.getParameter("email");
		String artistId = request.getParameter("artist_id");
	    
	    Gson gson = new Gson();
	    JsonObject result = new JsonObject();
	    
	    response.setContentType("application/json");
	    PrintWriter out = response.getWriter();
	    
	    try {
	    	//database connection (Lab9)
		    String dbDriver =  "com.mysql.jdbc.Driver"; 
	        String dbURL = "jdbc:mysql:// localhost:3306/"; 
	        
	        String dbName = "artsyDB"; 
	        String dbUsername = "root"; 
	        String dbPassword = "Juliaalie0716"; 
	        
	        Class.forName(dbDriver);
	        Connection conn = DriverManager.getConnection(dbURL + dbName, dbUsername, dbPassword);
	        
	        PreparedStatement stmt = conn.prepareStatement("INSERT INTO Favorites (user_email, artist_id) VALUES (?, ?)");
			stmt.setString(1, email);
			stmt.setString(2, artistId);
			stmt.executeUpdate();
			
			result.addProperty("status", "success");
			
			conn.close();
	    	
	    }
	    catch (Exception e) {
	    	e.printStackTrace();
	    	result.addProperty("status", "error");
	    }
	    
	    out.print(gson.toJson(result));
	    out.flush();
	}
}
