package org.jboss.tools.example.html5.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Timer;
import java.util.TimerTask;
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

import org.jboss.tools.example.html5.data.MemberRepository;
import org.jboss.tools.example.html5.model.Member;

import edu.umd.cs.example.LastFM;

@Stateless
public class PSLRegistration {

	@Inject
    private Logger log;

    @Inject
    private EntityManager em;

    @Inject
    private MemberRepository mr;
    
    @Resource
    private SessionContext scx;
	
    private ArrayList<PSLRequest> requestQueue = new ArrayList<PSLRequest>();
    private HashMap<String, PSLRequest> activeQueue = new HashMap<String, PSLRequest>();
    private final int MAX_RUNS = 1000;
    
    private final int secondsBetweenCrawls = 30;
    
    private Timer timer = new Timer();
    private boolean timerInitialized = false;
    
    private int currentCycle = 0;
    
	public void runPSLOnMember( Member member ) {
		pushQueue(member);
	}
	
	public void pushQueue(Member m) {
		System.out.println("PSL request added.");
		requestQueue.add( new PSLRequest( currentCycle, m ) );
		if ( !timerInitialized ) {
			updateQueue();	// run this script immediately too, for the first user.
			timerInitialized = true;
		}
	}
	
	public void freeRun( Member m ) {
		System.out.println("Run freed by " + m.getAMTID() );
		activeQueue.remove( m.getAMTID() );
		
	}
	
	public void updateQueue() {
		if ( activeQueue.size() < MAX_RUNS ) {
			if ( requestQueue.size() > 0 ) {
				
				PSLRequest nextRequest = null;
				
				//	Check on all of the previously run jobs
//				Iterator<String> it = activeQueue.keySet().iterator();
//				while ( it.hasNext() ) {
//					PSLRequest nextCheck = activeQueue.get( it.next() );
//					if ( ( currentCycle - nextCheck.requestCycle ) > 21 ) {
//						nextRequest = nextCheck;
//						nextRequest.requestCycle = currentCycle;
//						System.out.println( "" + nextRequest.member.getAMTID() + " has been waiting too long, restarting.");
//						break;
//					}
//				}
				
				//	If all the jobs look fine, get the next guy waiting in line
				if ( nextRequest == null ) {
					nextRequest = requestQueue.remove(0 );
					activeQueue.put( nextRequest.member.getAMTID(), nextRequest );
				}
				
				Member nextGuy = nextRequest.member;
				
				System.out.println( "Starting PSL request " + nextGuy.getAMTID() + ", " + nextGuy.getLastfmID() );
				PSLThread pt = new PSLThread( nextGuy.getAMTID(), nextGuy.getLastfmID(), scx, em, mr, this );
				pt.start();
				
			}
		}
		
		System.out.println("Ding! Current request queue: " + requestQueue.size() + ", active runs: " + activeQueue.size() );
		
		timer.schedule(new TimerTask() {
			@Override
			public void run() {
			    updateQueue();
			    currentCycle++;
			  }
		}, secondsBetweenCrawls*1000);
		
	}

}

class PSLRequest {
	
	protected PSLRequest(int rc, Member m) {
		this.requestCycle = rc;
		this.member = m;
	}
	
	public int requestCycle;
	public Member member;
}

