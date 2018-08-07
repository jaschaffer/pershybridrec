package org.jboss.tools.example.html5.service;

import edu.umd.cs.example.LastFMFinal;

public class PSLCrawlerTest {

	public static void main(String[] args) {
		UMAP2018FinishedEvent steven = new UMAP2018FinishedEvent(null);
		LastFMFinal harry = new LastFMFinal( steven );
		harry.doit( args[0], args[1] );
	}
	
}
