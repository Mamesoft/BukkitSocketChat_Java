package jp.mamesoft.bukkitsocketchat;

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

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.google.gson.JsonObject;




public class BukkitSocketChat extends JavaPlugin implements Listener{
	Logger log;
	public void onEnable(){
		this.saveDefaultConfig();
		
        getServer().getPluginManager().registerEvents(this, this);
		log = this.getLogger();
		
		
		try {
			final Socket socket = IO.socket(this.getConfig().getString("socketchaturl"));
		
			socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
				@Override
				public void call(Object... args) {
					JsonObject regobj = new JsonObject();
					regobj.addProperty("name", "Dareka");
					socket.emit("in", regobj);
				}
			}).on("log", new Emitter.Listener() {
				@Override
				public void call(Object... args) {}
			}).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
				@Override
				public void call(Object... args) {}
			});
			socket.connect();
			log.info("Try");
		} catch (URISyntaxException e) {
			// TODO 自動生成された catch ブロック
			e.printStackTrace();
			log.info("Catch");
		}
		
		log.info("BukkitSocketChat has been enabled!");
	}
	
	public void onDisable(){ 
		log.info("BukkitSocketChat has been disabled.");
	}
	
	
	@EventHandler
	public void onPlayerLogin(PlayerLoginEvent event) {
		log.info(event.getPlayer().getName() + "is Login.");
	}
	@EventHandler
	public void onPlayerQuit(PlayerQuitEvent event) {
		log.info(event.getPlayer().getName() + "is Logout.");
	}
	@EventHandler
	public void onPlayerChat(AsyncPlayerChatEvent event) {
		String msg = event.getMessage();
		String user = event.getPlayer().getName();
		String prefix = this.getConfig().getString("prefix");
		log.info("[" + user + "]" + msg);
		Bukkit.broadcastMessage(ChatColor.WHITE + "[" + ChatColor.GREEN + prefix + ChatColor.WHITE + "]" + "TEST");
	}
}