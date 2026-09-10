import json
import sys

def screen_resume(resume, job_description):
    # Mock - instant response
    has_python = "python" in resume.lower()
    has_aws = "aws" in resume.lower()
    years_match = any(str(y) in resume for y in ["3", "4", "5", "6", "7", "8", "9"])
    
    passed = has_python and has_aws and years_match
    
    return json.dumps({
        "pass": passed,
        "score": 85 if passed else 35,
        "reasoning": "Checked skills",
        "confidence": 0.8 if passed else 0.6
    })

if __name__ == "__main__":
    resume = sys.argv[1] if len(sys.argv) > 1 else ""
    jd = sys.argv[2] if len(sys.argv) > 2 else ""
    print(screen_resume(resume, jd))