package com.nvuillam.javacaller;

import java.lang.InterruptedException;
import java.util.concurrent.TimeUnit;

public class JavaCallerTester
{
    public static void main(String[] args)
    {
        System.out.println("JavaCallerTester is called !");
        System.out.println(java.util.Arrays.toString(args));
        if (args.length > 0 && args[0] != null && args[0].equals("--sleep")) {
            try {
                TimeUnit.MILLISECONDS.sleep(1000);
            } catch (InterruptedException eInterrupt) {
                System.err.println("JavaCallerTester interrupted !");
            } catch (Throwable t) {
                System.err.println("JavaCallerTester crashed !");
            }
        }
        System.out.println("Java runtime version " + getVersion());
    }

    private static int getVersion() {
        String version = System.getProperty("java.version");
        if (version.startsWith("1.")) {
            version = version.substring(2, 3);
        } 
        else {
            int dot = version.indexOf(".");
            if (dot != -1) {
                version = version.substring(0, dot);
            }
        }
        return Integer.parseInt(version);
    }
}