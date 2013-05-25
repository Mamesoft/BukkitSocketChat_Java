package jp.mamesoft.bukkitsocketchat;

import io.socket.IOAcknowledge;
import io.socket.IOCallback;
import io.socket.SocketIO;
import io.socket.SocketIOException;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.logging.Logger;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.event.player.PlayerLoginEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;

import org.json.JSONException;
import org.json.JSONObject;






public class BukkitSocketChat extends JavaPlugin implements Listener{
	Logger log;
	SocketIO socket;
	public void onEnable(){
		this.saveDefaultConfig();
		final String url = this.getConfig().getString("socketchaturl");
		final String prefix = this.getConfig().getString("prefix");
		final String pass = this.getConfig().getString("socket_pass");
        getServer().getPluginManager().registerEvents(this, this);
		log = this.getLogger();
		
		try {
			socket = new SocketIO(url);
	        socket.connect(new IOCallback() {
	            @Override
	            public void onMessage(JSONObject json, IOAcknowledge ack) {
	                try {
	                    log.info("Server said:" + json.toString(2));
	                } catch (JSONException e) {
	                    e.printStackTrace();
	                }
	            }
	
	            @Override
	            public void onMessage(String data, IOAcknowledge ack) {
	                log.info("Server said: " + data);
	            }
	
	            @Override
	            public void onError(SocketIOException socketIOException) {
	                log.info("an Error occured");
	                socketIOException.printStackTrace();
	            }
	
	            @Override
	            public void onDisconnect() {
	                log.info("Connection terminated.");
	            }
	
	            @Override
	            public void onConnect() {
	                log.info("Connection established");
	            }
	
	            @Override
	            public void on(String event, IOAcknowledge ack, Object... args) {
	            	if (event.equals("log")){
		            	final JSONObject jsondata = (JSONObject)args[0];
		            	log.info(jsondata.toString());
		            	if (!jsondata.isNull("comment")){
		            		String name = jsondata.getString("name");
		            		if (jsondata.isNull("channel") && name != "ゲームサーバー"){
			            		String comment = jsondata.getString("comment");
			            		String ip = jsondata.getString("ip");
			            		Bukkit.broadcastMessage(ChatColor.GREEN + "[" +  prefix + "]" + ChatColor.WHITE + name + " : " + comment + " (" + ip + ")");
		            		}
		            	} 
	            	}
	                log.info("Server triggered event '" + event + "'");
            	
	            }
	        });
	
	        // This line is cached until the connection is establisched.
	        socket.emit("register", new JSONObject().put("mode", "client").put("lastid", 1));
	        socket.emit("inout", new JSONObject().put("name", "ゲームサーバー").put("gameuser", "in").put("pass", pass));
	        
		
		} catch (MalformedURLException e1) {
			// TODO 自動生成された catch ブロック
			e1.printStackTrace();
		}
        
		log.info("BukkitSocketChat has been enabled!");
	}
	
	public void onDisable(){ 
		log.info("BukkitSocketChat has been disabled.");
	}
	
	
	@EventHandler
	public void onPlayerLogin(PlayerLoginEvent event) {
		
		socket.emit("say", new JSONObject().put("comment", "「" + event.getPlayer().getName() + "」さんが参加しました"));
		log.info(event.getPlayer().getName() + "is Login.");
	}
	@EventHandler
	public void onPlayerQuit(PlayerQuitEvent event) {
		socket.emit("say", new JSONObject().put("comment", "「" + event.getPlayer().getName() + "」さんが撤退しました"));
		log.info(event.getPlayer().getName() + "is Logout.");
	}
	@EventHandler
	public void onPlayerChat(AsyncPlayerChatEvent event) {
		String msg = event.getMessage();
		String user = event.getPlayer().getName();
		String world = event.getPlayer().getWorld().getName();
		String ip = event.getPlayer().getAddress().getHostString();
		log.info("[" + user + "]" + msg);
		socket.emit("say", new JSONObject().put("comment", msg).put("user", user).put("channel", world).put("ip", ip).put("pass", this.getConfig().getString("socket_pass")));
	}
}