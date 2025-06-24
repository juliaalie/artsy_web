package juliaali_CSCI201_Assignment3;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		System.out.println("LoginServlet REACHED!!");
		//get the values from the request using 'getParameter'
		String fullname = request.getParameter("fullname");
		String email = request.getParameter("email");
		String password = request.getParameter("password");
		
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
			
			//check if email already exists
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
			stmt.setString(1, email);
			ResultSet rs = stmt.executeQuery();
			
			if(rs.next()) { //if email exists
				result.addProperty("status", "error");
	        	result.addProperty("message", "Email already exists");
			}
			else { //else insert data into database
				PreparedStatement stmt1 = conn.prepareStatement("INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)");
				stmt1.setString(1, fullname);
				stmt1.setString(2, email);
				stmt1.setString(3, password);
				
				stmt1.executeUpdate();
				//test debug
				System.out.println("User inserted successfully.");

		        result.addProperty("status", "success");
			}
			
			conn.close();
		}
		catch (Exception e){
			e.printStackTrace();
			result.addProperty("status", "error");
        	result.addProperty("message", "Server Error");
		}

		out.print(gson.toJson(result));
	    out.flush();
	}
}
