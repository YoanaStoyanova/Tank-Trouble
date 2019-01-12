package bg.tank.trouble.server;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Table(name = "player")
public class Player {

    @Column(name = "userId")
    @Id
    private String id;

    @JsonInclude()
    @Transient
    private String email;

    @Column(name = "userName")
    private String name;

    private Integer totalScore;

    Player(){}

    public Integer getTotalScore() { return totalScore; }

    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void print(){
        System.out.println("userId: " + id + "  email: " + email + "  userName: " + name + " score: " + totalScore );
    }
}
