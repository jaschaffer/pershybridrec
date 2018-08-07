/*
 * JBoss, Home of Professional Open Source
 * Copyright 2013, Red Hat, Inc. and/or its affiliates, and individual
 * contributors by the @authors tag. See the copyright.txt in the
 * distribution for a full listing of individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jboss.tools.example.html5.rest;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.logging.Logger;

import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.persistence.NoResultException;
import javax.transaction.HeuristicMixedException;
import javax.transaction.HeuristicRollbackException;
import javax.transaction.NotSupportedException;
import javax.transaction.RollbackException;
import javax.transaction.SystemException;
import javax.transaction.UserTransaction;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.ValidationException;
import javax.validation.Validator;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.jboss.tools.example.html5.data.MemberRepository;
import org.jboss.tools.example.html5.model.Member;
import org.jboss.tools.example.html5.service.MemberRegistration;
import org.jboss.tools.example.html5.service.PSLRegistration;

/**
 * JAX-RS Example
 * <p/>
 * This class produces a RESTful service to read/write the contents of the members table.
 */
@Path("/members")
@RequestScoped
@Stateful
public class MemberService {
	
	private Random jerry = new Random(System.currentTimeMillis());
	
    @Inject
    private Logger log;

    @Inject
    private Validator validator;

    @Inject
    private MemberRepository repository;

    @Inject
    MemberRegistration registration;
    
    @Inject
    PSLRegistration pslService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Member> listAllMembers() {
        return repository.findAllOrderedByName();
    }

    @GET
    @Path("/{id:[0-9][0-9]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Member lookupMemberById(@PathParam("id") long id) {
        Member member = repository.findById(id);
        if (member == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
        return member;
    }
    
    @GET
    @Path("/{amtid:[A][A-Za-z0-9]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Member lookupMemberByAMTID(@PathParam("amtid") String amtid) {
        Member member = repository.findByAMTID(amtid);
        if (member == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
        return member;
    }
    
    @GET
    @Path("/all")
    @Produces(MediaType.TEXT_PLAIN)
    public String getAllMembersFormatted() {
    	String result = "amtid,satisfice,";
    	result += "randoa1-1,randoa1-2,randoa1-3,randoa1-4,randoa1-5,randon1-1,randon1-2,randon1-3,randon1-4,randon1-5,";
    	result += "randoa2-1,randoa2-2,randoa2-3,randoa2-4,randoa2-5,randon2-1,randon2-2,randon2-3,randon2-4,randon2-5,";
    	result += "randoa3-1,randoa3-2,randoa3-3,randoa3-4,randoa3-5,randon3-1,randon3-2,randon3-3,randon3-4,randon3-5,";
    	result += "acc1-1,acc1-2,acc1-3,acc1-4,acc1-5,nov1-1,nov1-2,nov1-3,nov1-4,nov1-5,";
    	result += "ibcf,cbj,ubcf,pb,iblf,cbt,sb,";
    	result += "acc2-1,acc2-2,acc2-3,acc2-4,acc2-5,nov2-1,nov2-2,nov2-3,nov2-4,nov2-5,";
    	result += "ibcf,cbj,ubcf,pb,iblf,cbt,sb,";
    	result += "acc3-1,acc3-2,acc3-3,acc3-4,acc3-5,nov3-1,nov3-2,nov3-3,nov3-4,nov3-5,";
    	result += "text1,text2,text3,text4,coll1,coll2,coll3,coll4,venn1,venn2,venn3,venn4,clust1,clust2,clust3,clust4\n";
    	
    	List<Member> allMembers = repository.findAllOrderedByName();
    	for ( int i = 0; i < allMembers.size(); i++ ) {
    		Member nextMember = allMembers.get( i );
    		if ( !nextMember.getRData().equals("none"))
    			result += nextMember.convertToCSV();
    	}
        return result;
    }
    
    @GET
    @Path("/suggestions")
    @Produces(MediaType.TEXT_PLAIN)
    public String getAllSuggestions() {
    	String result = "amtid,suggestion";
    	List<Member> allMembers = repository.findAllOrderedByName();
    	for ( int i = 0; i < allMembers.size(); i++ ) {
    		Member nextMember = allMembers.get( i );
    		if ( !nextMember.getRData().equals("none"))
    			result += nextMember.getSuggestions();
    	}
        return result;
    }

    /**
     * Creates a new member from the values provided. Performs validation, and will return a JAX-RS response with either 200 ok,
     * or with a map of fields, and related errors.
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createMember(Member newMember) {

        Response.ResponseBuilder builder = null;

        try {
        	
            // Validates member using bean validation
        	System.out.println( "Creating: " + newMember.getAMTID() );
            validateMember(newMember);
            
            newMember.setCreationTime( System.currentTimeMillis() );
            newMember.setCompletionCode( generateCompletionCode( newMember.getAMTID() ) );
            
            registration.register(newMember);
            pslService.runPSLOnMember( newMember );
            
            // Create an "ok" response
            builder = Response.ok().entity(newMember);
        } catch (ConstraintViolationException ce) {
            // Handle bean validation issues
            builder = createViolationResponse(ce.getConstraintViolations());
        } catch (ValidationException e) {
            // Handle the unique constrain violation
            Map<String, String> responseObj = new HashMap<String, String>();
            responseObj.put("amtid", "Already exists");
            builder = Response.status(Response.Status.CONFLICT).entity(responseObj);
        } catch (Exception e) {
            // Handle generic exceptions
            Map<String, String> responseObj = new HashMap<String, String>();
            responseObj.put("error", e.getMessage());
            builder = Response.status(Response.Status.BAD_REQUEST).entity(responseObj);
        }

        return builder.build();
    }
    
    private String generateCompletionCode( String amtID ) {
    	String cc = "";
    	for ( int i = 0; i < 6; i++ ) {
    		cc += "" + jerry.nextInt(10);
    	}
    	
    	return amtID + "" + cc;
    }

    /**
     * <p>
     * Validates the given Member variable and throws validation exceptions based on the type of error. If the error is standard
     * bean validation errors then it will throw a ConstraintValidationException with the set of the constraints violated.
     * </p>
     * <p>
     * If the error is caused because an existing member with the same email is registered it throws a regular validation
     * exception so that it can be interpreted separately.
     * </p>
     * 
     * @param member Member to be validated
     * @throws ConstraintViolationException If Bean Validation errors exist
     * @throws ValidationException If member with the same email already exists
     */
    private void validateMember(Member member) throws ConstraintViolationException, ValidationException {
        // Create a bean validator and check for issues.
        Set<ConstraintViolation<Member>> violations = validator.validate(member);

        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(new HashSet<ConstraintViolation<?>>(violations));
        }

        // Check the uniqueness of the AMTID
        if (amtIDAlreadyExists(member.getAMTID())) {
            throw new ValidationException("Unique AMTID Violation");
        }
    }

    /**
     * Creates a JAX-RS "Bad Request" response including a map of all violation fields, and their message. This can then be used
     * by clients to show violations.
     * 
     * @param violations A set of violations that needs to be reported
     * @return JAX-RS response containing all violations
     */
    private Response.ResponseBuilder createViolationResponse(Set<ConstraintViolation<?>> violations) {
        log.fine("Validation completed. violations found: " + violations.size());

        Map<String, String> responseObj = new HashMap<String, String>();

        for (ConstraintViolation<?> violation : violations) {
            responseObj.put(violation.getPropertyPath().toString(), violation.getMessage());
        }

        return Response.status(Response.Status.BAD_REQUEST).entity(responseObj);
    }

    /**
     * Checks if a member with the same email address is already registered. This is the only way to easily capture the
     * "@UniqueConstraint(columnNames = "email")" constraint from the Member class.
     * 
     * @param email The email to check
     * @return True if the email already exists, and false otherwise
     */
    public boolean amtIDAlreadyExists(String email) {
        Member member = null;
        try {
            member = repository.findByAMTID(email);
        } catch (NoResultException e) {
            // ignore
        }
        return member != null;
    }
}
