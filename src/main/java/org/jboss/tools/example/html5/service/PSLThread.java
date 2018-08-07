package org.jboss.tools.example.html5.service;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import javax.annotation.Resource;
import javax.ejb.SessionContext;
import javax.ejb.Stateful;
import javax.ejb.Stateless;
import javax.enterprise.context.RequestScoped;
import javax.enterprise.event.Event;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.HeuristicMixedException;
import javax.transaction.HeuristicRollbackException;
import javax.transaction.NotSupportedException;
import javax.transaction.RollbackException;
import javax.transaction.SystemException;
import javax.transaction.UserTransaction;

import org.jboss.tools.example.html5.data.MemberRepository;
import org.jboss.tools.example.html5.model.Member;

import edu.umd.cs.example.LastFMFinal;

public class PSLThread extends Thread {

	private String amtid;
	private String lastfmid;
	private SessionContext scx;
	private EntityManager em;
	private MemberRepository mr;
	private PSLRegistration psl;
	
	public PSLThread( String amtid, String lastfmid, SessionContext scx, EntityManager em, MemberRepository mr, PSLRegistration psl ) {
		this.amtid = amtid;
		this.lastfmid = lastfmid;
		this.scx = scx;
		this.em = em;
		this.mr = mr;
		this.psl = psl;
	}
	
	@Override
	public void run() {
		
		System.out.println( "Running PSL Thread...");
		
		if ( !System.getProperty("os.name").contains( "Windows" ) ) {
		
			try {
				System.out.println( "Deploying Crawler...");
				UMAP2018FinishedEvent steven = new UMAP2018FinishedEvent( this );
				LastFMFinal harry = new LastFMFinal( steven );
				harry.doit( lastfmid, "/home/james/cikm2018/devstudio/runtimes/jboss-eap/bin/last.fm-mturk/" );
			} catch (Exception e) {
				e.printStackTrace();
			}
		
		}
		else {
			try {
				System.out.println("Writing stub file...");
				sleep( 3000 );
			    
			    BufferedReader br = new BufferedReader(new FileReader("psl-stub.txt"));
			    String jsonData = br.readLine();
			    hibernateJSON( jsonData );
			    
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (UnsupportedEncodingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
		}
		
	}
	
	public void hibernateJSON( String jsonData ) {
		System.out.println( "Writing qData for " + mr.findByAMTID( amtid ).getAMTID() );
		UserTransaction userTxn = scx.getUserTransaction();
		try {
			userTxn.begin();
			Member member = mr.findByAMTID( amtid );
			member.setQData(jsonData);
			member.setCrawlTime(System.currentTimeMillis());
			userTxn.commit();
			
			psl.freeRun( member );
			
		} catch (NotSupportedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SystemException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalStateException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (RollbackException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (HeuristicMixedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (HeuristicRollbackException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
