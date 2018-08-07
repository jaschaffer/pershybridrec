package org.jboss.tools.example.html5.service;

import edu.umd.cs.example.PSLFinishedEvent;

public class UMAP2018FinishedEvent implements PSLFinishedEvent {

	private PSLThread parentThread = null;
	public UMAP2018FinishedEvent( PSLThread parentThread ) {
		this.parentThread = parentThread;
	}
	
	@Override
	public void pslFinishedEvent(String jsonData) {
		System.out.println( "PSL Finished crawling.");
		if ( parentThread != null )
			parentThread.hibernateJSON(jsonData);
		else
			System.out.println(jsonData);
	}

}
