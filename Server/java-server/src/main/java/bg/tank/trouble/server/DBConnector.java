package bg.tank.trouble.server;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.hibernate.query.Query;

import javax.persistence.Tuple;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

public class DBConnector {

   private static SessionFactory sessionFactory;
   private static boolean isInitialized = false;

   protected static void initialize() {
      Properties properties = new Properties();
      try {
         FileInputStream hibernateProps = new FileInputStream("./hibernate.properties");
         properties.load(hibernateProps);
         sessionFactory = new Configuration().addProperties(properties).addAnnotatedClass(Player.class).buildSessionFactory();
      } catch (IOException e) {
         System.out.println("Failed to load DB connection properties \n" + e);
      }

      isInitialized = true;
   }

   public static void save(Object data) {
      if (!isInitialized) {
         initialize();
      }

      try (Session session = sessionFactory.openSession();) {
         Transaction transaction = session.beginTransaction();
         session.persist(data);
         transaction.commit();
         System.out.println("Data saved to db" + data);
      } catch (Exception e) {
         System.out.println("Failed to save data to db \n" + e);
      }
   }

   /**
    *
    * @param object ORM to look for in db
    * @param toSelect columns to select from db
    * @param constraints filtering db tuples
    * @param <T>
    */
   public static <T> void selectFromWhereAnd(T object, List<String> toSelect, Map<String, String> constraints) {
      if (!isInitialized) {
         initialize();
      }
      try (Session session = sessionFactory.openSession()) {
         CriteriaBuilder builder = session.getCriteriaBuilder();
         CriteriaQuery<Tuple> query = builder.createQuery(Tuple.class);
         Root<?> root = query.from(object.getClass());
         List<Predicate> predicates = new ArrayList<>();
         constraints.keySet().
               forEach(field -> predicates.add(builder.equal(root.get(field), constraints.get(field))));
         query.multiselect(toSelect.stream().map(root::get).collect(Collectors.toList())).where(predicates.toArray(new Predicate[]{}));
         Query<Tuple> q = session.createQuery(query);
         List<Tuple> resultList = q.getResultList();
         for (Tuple result : resultList) {
            System.out.println(result.get(0) + " " + result.get(2));
         }

      } catch (Exception e) {
         System.out.println("Failed to execute select query for " + object.getClass() + " from db");
      }
   }

   public static void selectAllFromWhereAnd(Player object, Map<String, String> constraints) {
      /*
         Method has to be able to handle more types than just Player
       */
      System.out.println("In selectByWhere method");
      if (!isInitialized) {
         initialize();
      }
      try (Session session = sessionFactory.openSession()) {
         CriteriaBuilder builder = session.getCriteriaBuilder();
         CriteriaQuery<Player> query = builder.createQuery(Player.class);
         Root<Player> root = query.from(Player.class);
         List<Predicate> predicates = new ArrayList<>();
         constraints.keySet().
               forEach(field -> predicates.add(builder.equal(root.get(field), constraints.get(field))));

         query.select(root).where(predicates.toArray(new Predicate[]{}));
         Query<Player> q = session.createQuery(query);
         List<Player> resultList = q.getResultList();
         for (Player result : resultList) {
            System.out.println(result.id + " " + result.name + " " + result.totalScore);
         }

      } catch (Exception e) {
         System.out.println("Failed to execute select query for " + object.getClass() + " from db");
      }
   }

}
