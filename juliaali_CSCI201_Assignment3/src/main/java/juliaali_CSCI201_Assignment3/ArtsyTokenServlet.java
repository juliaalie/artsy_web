package juliaali_CSCI201_Assignment3;

import java.io.*;
import java.net.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/ArtsyTokenServlet")
public class ArtsyTokenServlet extends HttpServlet{
	private static final long serialVersionUID = 1L;
	
	private static final String clientID = "111";
	private static final String clientSecret = "222";
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("application/json");
	    PrintWriter out = response.getWriter();
	    Gson gson = new Gson();
	    
	    try {
	    	URL url = new URL("https://api.artsy.net/api/tokens/xapp_token");
	    	HttpURLConnection conn = (HttpURLConnection) url.openConnection();
	    	conn.setRequestMethod("POST");
	    	conn.setRequestProperty("Content-Type", "application/json");
	    	conn.setDoOutput(true);
	    	
	    	JsonObject credentials = new JsonObject();
	        credentials.addProperty("client_id", clientID);
	        credentials.addProperty("client_secret", clientSecret);
	        
	        OutputStream os = conn.getOutputStream();
	        os.write(gson.toJson(credentials).getBytes());
	        os.flush();
	        os.close();
	        
	        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
	        StringBuilder result = new StringBuilder();
	        String line;
	        while ((line = in.readLine()) != null) {
	          result.append(line);
	        }
	        in.close();

	        //parse Artsy's response
	        JsonObject artsyResponse = gson.fromJson(result.toString(), JsonObject.class);
	        String token = artsyResponse.get("token").getAsString();

	        //send token back to frontend
	        JsonObject jsonResponse = new JsonObject();
	        jsonResponse.addProperty("token", token);
	        out.print(gson.toJson(jsonResponse));
	    }
	    catch (Exception e) {
	    	e.printStackTrace();
	    	JsonObject error = new JsonObject();
	        error.addProperty("error", "Failed to retrieve token");
	        out.print(gson.toJson(error));
	    }
	}

}
