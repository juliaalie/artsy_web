package juliaali_CSCI201_Assignment3;

import java.io.*;
import java.sql.*;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@WebServlet("/getFavorite")
public class GetFavorite extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String email = request.getParameter("email");
	    
	    Gson gson = new Gson();
	    JsonObject result = new JsonObject();
	    JsonArray favorites = new JsonArray();
	    
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
	        
	        PreparedStatement stmt = conn.prepareStatement("SELECT artist_id FROM Favorites WHERE user_email = ?");
			stmt.setString(1, email);
			
			ResultSet rs = stmt.executeQuery();
			
			while (rs.next()) {
				favorites.add(rs.getString("artist_id"));
			}
			
			result.add("favorites", favorites);
			
			conn.close();
	    	
	    }
	    catch (Exception e) {
	    	e.printStackTrace();
	    	result.addProperty("status", "error");
	    }
	    
	    out.print(gson.toJson(result));
	    out.flush();
	    
	    //test debug
	    System.out.println("current email: " + email);
	    System.out.println("favorite artist IDs: " + gson.toJson(favorites));

	}
}
