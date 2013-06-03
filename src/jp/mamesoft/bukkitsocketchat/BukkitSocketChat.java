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
	String chatname;
	String Lang;

	public void onEnable(){
		this.saveDefaultConfig();

		Lang = this.getConfig().getString("language");
		if (Lang.equals("en")){
			chatname = "Game Server";
		}else if(Lang.equals("ja")){
			chatname = "ゲームサーバー";
		}else{
			log.info("[WARNING]" + Lang + " is not supported.");
			log.info("[WARNING]English(en) or Japanese(ja) Only.");
			log.info("[WARNING]言語設定" + Lang + "は使用できません");
			log.info("[WARNING]英語(en)か日本語(ja)のみ対応しています。");
			chatname = "Game Server";
		}
		
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
	                log.info("[WARNING]Socket Error!");
	                socketIOException.printStackTrace();
	            }
	
	            @Override
	            public void onDisconnect() {
	                log.info("[WARNING]SocketChat Disconnect!");
	            }
	
	            @Override
	            public void onConnect() {
	                log.info("SocketChat Connect.");
	            }
	
	            @Override
	            public void on(String event, IOAcknowledge ack, Object... args) {
	            	if (event.equals("log")){
		            	final JSONObject jsondata = (JSONObject)args[0];
		            	log.info(jsondata.toString());
		            	if (!jsondata.isNull("comment")){
		            		String name = jsondata.getString("name");
		            		if (jsondata.isNull("channel") && !name.equals(chatname)){
			            		String comment = jsondata.getString("comment");
			            		String ip = jsondata.getString("ip");
			            		Bukkit.broadcastMessage(ChatColor.GREEN + "[" +  prefix + "]" + ChatColor.WHITE + name + " : " + comment + " (" + ip + ")");
		            		}
		            	}
	            	}
	            }
	        });
	        socket.emit("register", new JSONObject().put("mode", "client").put("lastid", 1));
	        socket.emit("inout", new JSONObject().put("name", chatname).put("pass", pass));
	        log.info("BukkitSocketChat has been enabled!");
		
		} catch (MalformedURLException e1) {
			e1.printStackTrace();
			log.info("[WARNING]BukkitSocketChat is Error!");
		}
        
		
	}
	
	public void onDisable(){
        socket.emit("inout", new JSONObject().put("name", chatname).put("pass", this.getConfig().getString("socket_pass")));
        socket.disconnect();
		log.info("BukkitSocketChat has been disabled.");
	}
	
	
	@EventHandler
	public void onPlayerLogin(PlayerLoginEvent event) {
		if (Lang.equals("ja")){
			socket.emit("say", new JSONObject().put("comment", "「" + event.getPlayer().getName() + "」さんが参加しました"));
		}else{
			socket.emit("say", new JSONObject().put("comment", event.getPlayer().getName() + " is LogIn."));
		}
	}
	@EventHandler
	public void onPlayerQuit(PlayerQuitEvent event) {
		if (Lang.equals("ja")){
			socket.emit("say", new JSONObject().put("comment", "「" + event.getPlayer().getName() + "」さんが撤退しました"));
		}else{
			socket.emit("say", new JSONObject().put("comment", event.getPlayer().getName() + " is LogOut"));
		}
	}
	@EventHandler
	public void onPlayerChat(AsyncPlayerChatEvent event) {
		String msg = event.getMessage();
		String user = event.getPlayer().getName();
		String world = event.getPlayer().getWorld().getName();
		String ip = event.getPlayer().getAddress().getHostString();
		socket.emit("say", new JSONObject().put("comment", msg).put("user", user).put("channel", world).put("ip", ip).put("pass", this.getConfig().getString("socket_pass")));
	}
}