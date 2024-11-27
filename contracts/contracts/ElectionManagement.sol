
pragma solidity ^0.8.0;

contract ElectionManagement {
    address public admin;

    struct Election {
        uint id;
        string name;
        bool active;
        uint endTime;
        bool deleted; 
    }

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        bool deleted; 
    }

    struct Voter {
        address voterAddress;
        string name;
        string dob;
        string gender;
        string userAddress; 
        bool isApproved;
        bool isDeclined;
        string comment; 
        
    }

    mapping(uint => Election) public elections;
    mapping(uint => mapping(uint => Candidate)) public electionCandidates; 
    mapping(uint => uint) public candidateCount; 
    mapping(address => Voter) public voters; 
    address[] public voterAddresses; 
    uint public electionCount;
    mapping(uint => mapping(address => bool)) public hasVoted; 

    mapping(uint => mapping(address => bytes32)) public voteHashes; 
    mapping(uint => bool) public resultsPublished;

  

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

   

    // create a new election
    function createElection(string memory _name, uint _endTime) public onlyAdmin {
        electionCount++;
        elections[electionCount] = Election(electionCount, _name, false, _endTime, false);
    }

    // start an election
    function startElection(uint _electionId) public onlyAdmin {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        require(!elections[_electionId].active, "Election is already active");
        require(!elections[_electionId].deleted, "Election has been deleted");
        elections[_electionId].active = true;
    }

    // stop an election
    function stopElection(uint _electionId) public onlyAdmin {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        require(elections[_electionId].active, "Election is already inactive");
        require(!elections[_electionId].deleted, "Election has been deleted");
        elections[_electionId].active = false;
    }

     // delete an election and reorder the IDs
    function deleteElection(uint _electionId) public onlyAdmin {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        require(!elections[_electionId].deleted, "Election has already been deleted");
        delete elections[_electionId];

        for (uint i = _electionId; i < electionCount; i++) {
            elections[i] = elections[i + 1];  
            elections[i].id = i;              
        }
        delete elections[electionCount];
        electionCount--;  
    }

    function checkAndStopElection(uint _electionId) public {
    require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
    require(elections[_electionId].active, "Election is already inactive");

    if (block.timestamp >= elections[_electionId].endTime) {
        elections[_electionId].active = false;
    }
}

    // To get all election details
    function getElections() public view returns (Election[] memory) {
        uint validCount = 0;
        for (uint i = 1; i <= electionCount; i++) {
            if (!elections[i].deleted) {
                validCount++;
            }
        }

        Election[] memory allElections = new Election[](validCount);
        uint index = 0;
        for (uint i = 1; i <= electionCount; i++) {
            if (!elections[i].deleted) {
                allElections[index] = elections[i];
                index++;
            }
        }
        return allElections;
    }

    // CANDIDATE MANAGEMENT 

    // Add a candidate to an election
    function addCandidate(uint _electionId, string memory _name) public onlyAdmin {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        require(!elections[_electionId].deleted, "Election has been deleted");
        
        candidateCount[_electionId]++;
        uint candidateId = candidateCount[_electionId];
        electionCandidates[_electionId][candidateId] = Candidate(candidateId, _name, 0, false);
    }

    // Delete a candidate from an election
    function deleteCandidate(uint _electionId, uint _candidateId) public onlyAdmin {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        require(_candidateId > 0 && _candidateId <= candidateCount[_electionId], "Invalid candidate ID");
        require(!electionCandidates[_electionId][_candidateId].deleted, "Candidate has already been deleted");

        electionCandidates[_electionId][_candidateId].deleted = true; 
    }

    // To get all candidates for a specific election
    function getCandidates(uint _electionId) public view returns (Candidate[] memory) {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        require(!elections[_electionId].deleted, "Election has been deleted");

        uint validCandidateCount = 0;
        for (uint i = 1; i <= candidateCount[_electionId]; i++) {
            if (!electionCandidates[_electionId][i].deleted) {
                validCandidateCount++;
            }
        }

        Candidate[] memory candidates = new Candidate[](validCandidateCount);
        uint index = 0;
        for (uint i = 1; i <= candidateCount[_electionId]; i++) {
            if (!electionCandidates[_electionId][i].deleted) {
                candidates[index] = electionCandidates[_electionId][i];
                index++;
            }
        }

        return candidates;
    }

    //  VOTER MANAGEMENT 

    event VoterRegistered(address indexed voterAddress);
    event VoterApproved(address indexed voterAddress);
    event VoterDeclined(address indexed voterAddress, string comment);

    // voter registration
function registerVoter(string memory _name, string memory _dob, string memory _gender, string memory _userAddress) public {
    
    if (voters[msg.sender].isDeclined) {
        
        voters[msg.sender].name = _name;
        voters[msg.sender].dob = _dob;
        voters[msg.sender].gender = _gender;
        voters[msg.sender].userAddress = _userAddress;
        voters[msg.sender].isApproved = false;
        voters[msg.sender].isDeclined = false;
        voters[msg.sender].comment = "";
    } else {
        
        require(bytes(voters[msg.sender].name).length == 0, "Voter already registered");
        voters[msg.sender] = Voter(msg.sender, _name, _dob, _gender, _userAddress, false, false, "");
        voterAddresses.push(msg.sender); 
    }
    
    emit VoterRegistered(msg.sender); 
}

    // Approve a voter
    function approveVoter(address _voterAddress) public onlyAdmin {
        require(bytes(voters[_voterAddress].name).length > 0, "Voter not found");
        voters[_voterAddress].isApproved = true;
        voters[_voterAddress].isDeclined = false;

        emit VoterApproved(_voterAddress); 
    }

    // Decline a voter
    function declineVoter(address _voterAddress, string memory _comment) public onlyAdmin {
        require(bytes(voters[_voterAddress].name).length > 0, "Voter not found");
        voters[_voterAddress].isApproved = false;
        voters[_voterAddress].isDeclined = true;
        voters[_voterAddress].comment = _comment;

        emit VoterDeclined(_voterAddress, _comment); 
    }

    // voter status
    function getVoterStatus() public view returns (bool, bool, string memory) {
        require(bytes(voters[msg.sender].name).length > 0, "Voter is not registered");

        Voter memory voter = voters[msg.sender];
        return (voter.isApproved, voter.isDeclined, voter.comment);
    }

    // To get all voter details
    function getAllVoters() public view returns (Voter[] memory) {
        Voter[] memory allVoters = new Voter[](voterAddresses.length);
        for (uint i = 0; i < voterAddresses.length; i++) {
            allVoters[i] = voters[voterAddresses[i]];
        }
        return allVoters;
    }

     // VOTING FUNCTIONALITY 

    event VoteCasted(uint indexed electionId, uint indexed candidateId, address voter , bytes32 voteHash);

    // To cast a vote for a candidate in a specific election
    function vote(uint _electionId, uint _candidateId) public {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        require(elections[_electionId].active, "Election is not active");
        require(!elections[_electionId].deleted, "Election has been deleted");
        require(block.timestamp < elections[_electionId].endTime, "Election has ended. You cannot vote.");
        require(!hasVoted[_electionId][msg.sender], "You have already voted in this election");
        require(_candidateId > 0 && _candidateId <= candidateCount[_electionId], "Invalid candidate ID");
        require(voters[msg.sender].isApproved, "You are not approved to vote");
        require(!electionCandidates[_electionId][_candidateId].deleted, "Candidate has been deleted");

        electionCandidates[_electionId][_candidateId].voteCount++;

        hasVoted[_electionId][msg.sender] = true;

       // Generate and store the vote hash based on election ID, candidate ID, and voter address.
        bytes32 voteHash = keccak256(abi.encodePacked(_electionId, _candidateId, msg.sender));
        voteHashes[_electionId][msg.sender] = voteHash;

        emit VoteCasted(_electionId, _candidateId, msg.sender, voteHash);

    }

    // To check if a voter has voted in the specific election
    function hasVotedInElection(uint _electionId) public view returns (bool) {
        return hasVoted[_electionId][msg.sender];
    }
    //  regain the stored vote hash
    function getVoteHash(uint _electionId) public view returns (bytes32) {
        return voteHashes[_electionId][msg.sender];


}


// To get the results of a specific election
function getElectionResults(uint _electionId) public view returns (Candidate[] memory) {
    
    require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
    require(!elections[_electionId].deleted, "Election has been deleted");
    require(block.timestamp > elections[_electionId].endTime, "Election is still ongoing. Results unavailable.");
    uint validCandidateCount = 0;
    for (uint i = 1; i <= candidateCount[_electionId]; i++) {
        if (!electionCandidates[_electionId][i].deleted) {
            validCandidateCount++;
        }
    }

    Candidate[] memory results = new Candidate[](validCandidateCount);
    uint index = 0;
    for (uint i = 1; i <= candidateCount[_electionId]; i++) {
        if (!electionCandidates[_electionId][i].deleted) {
            results[index] = electionCandidates[_electionId][i];
            index++;
        }
    }

    

    return results;
}

 //  publish result
function publishResults(uint _electionId) public onlyAdmin {
    require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
    require(!elections[_electionId].deleted, "Election has been deleted");
    require(block.timestamp >= elections[_electionId].endTime, "Election has not ended yet");
    require(!resultsPublished[_electionId], "Results have already been published");

    resultsPublished[_electionId] = true;
}

// To check if results are published 
function isResultsPublished(uint _electionId) public view returns (bool) {
    return resultsPublished[_electionId];
}

}



