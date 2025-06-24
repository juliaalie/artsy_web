package juliaali_CSCI201_Assignment3;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;
import com.google.gson.Gson;
import com.google.gson.JsonObject;


//https://www.geeksforgeeks.org/servlet-form-data/
//https://www.javaguides.net/2019/02/httpservlet-dopost-method-example.html
//https://www.geeksforgeeks.org/java-servlet-and-jdbc-example-insert-data-in-mysql/
@WebServlet("/login")
public class LoginServlet extends HttpServlet{
	private static final long serialVersionUID = 1L;
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		System.out.println("LoginServlet REACHED!!");
		//get the values from the request using 'getParameter'
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
	        
	        //check email and password
	        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Users WHERE email = ? AND password = ?");
	        	stmt.setString(1, email);
	        	stmt.setString(2, password);
	        ResultSet rs = stmt.executeQuery();
	        
	        if (rs.next()) { //if email and password exists
	            result.addProperty("status", "success");	        
	        } 
	        else { 
	        	result.addProperty("status", "error");
	        	result.addProperty("message", "Password or email is incorrect.");
	        }
	        
	        conn.close();
	    }
	    
	    catch (Exception e) {
	    	e.printStackTrace();
	    	result.addProperty("status", "error");
        	result.addProperty("message", "Server Error");
	    }
	    
	    out.print(gson.toJson(result));
	    out.flush();
	     
	}
}
