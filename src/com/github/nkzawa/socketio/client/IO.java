package com.github.nkzawa.socketio.client;


import com.github.nkzawa.socketio.parser.Parser;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.concurrent.ConcurrentHashMap;


public class IO {

    private static final ConcurrentHashMap<String, Manager> managers = new ConcurrentHashMap<String, Manager>();

    /**
     * Protocol version.
     */
    public static int protocol = Parser.protocol;


    private IO() {}

    public static Socket socket(String uri) throws URISyntaxException {
        return socket(uri, null);
    }

    public static Socket socket(String uri, Options opts) throws URISyntaxException {
        return socket(new URI(uri), opts);
    }

    public static Socket socket(URI uri) throws URISyntaxException {
        return socket(uri, null);
    }

    /**
     * Initializes a {@link Socket} from an existing {@link Manager} for multiplexing.
     *
     * @param uri uri to connect.
     * @param opts options for socket.
     * @return {@link Socket} instance.
     * @throws URISyntaxException
     */
    public static Socket socket(URI uri, Options opts) throws URISyntaxException {
        if (opts == null) {
            opts = new Options();
        }

        URL parsed;
        try {
            parsed = Url.parse(uri);
        } catch (MalformedURLException e) {
            throw new URISyntaxException(uri.toString(), e.getMessage());
        }
        URI href = parsed.toURI();
        Manager io;

        if (opts.forceNew || !opts.multiplex) {
            io = new Manager(href, opts);
        } else {
            String id = Url.extractId(parsed);
            if (!managers.containsKey(id)) {
                managers.putIfAbsent(id, new Manager(href, opts));
            }
            io = managers.get(id);
        }

        String path = uri.getPath();
        return io.socket(path != null && !path.isEmpty() ? path : "/");
    }


    public static class Options extends com.github.nkzawa.engineio.client.Socket.Options {

        public boolean forceNew;

        /**
         * Whether to enable multiplexing. Default is true.
         */
        public boolean multiplex = true;

        public boolean reconnection;
        public int reconnectionAttempts;
        public long reconnectionDelay;
        public long reconnectionDelayMax;
        public long timeout = -1;

    }
}
