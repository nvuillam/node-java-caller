package com.nvuillam.javacaller;

import java.lang.InterruptedException;
import java.util.concurrent.TimeUnit;

public class JavaCallerTester
{
    public static void main(String[] args)
    {
        System.out.println("JavaCallerTester is called !");
        System.out.println(java.util.Arrays.toString(args));
        if (args.length > 0 && args[0] != null && args[0] == "--sleep") {
            try {
                TimeUnit.MINUTES.sleep(1);
            } catch (InterruptedException eInterrupt) {
                System.err.println("JavaCallerTester interrupted !");
            } catch (Throwable t) {
                System.err.println("JavaCallerTester crashed !");
            }
        }
    }
}